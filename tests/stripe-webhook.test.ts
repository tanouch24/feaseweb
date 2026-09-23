import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  constructEventMock,
  subscriptionsRetrieveMock,
  webhookEventsInsertMock,
  webhookEventsDeleteEqMock,
  subscriptionSelectMaybeSingleMock,
  resolveClientIdMock,
  syncSubscriptionFromStripeMock,
  syncPaymentFromInvoiceMock,
} = vi.hoisted(() => ({
  constructEventMock: vi.fn(),
  subscriptionsRetrieveMock: vi.fn(),
  webhookEventsInsertMock: vi.fn(),
  webhookEventsDeleteEqMock: vi.fn(),
  subscriptionSelectMaybeSingleMock: vi.fn(),
  resolveClientIdMock: vi.fn(),
  syncSubscriptionFromStripeMock: vi.fn(),
  syncPaymentFromInvoiceMock: vi.fn(),
}));

vi.mock("@/lib/stripe/server", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: constructEventMock },
    subscriptions: { retrieve: subscriptionsRetrieveMock },
  }),
}));

vi.mock("@/lib/stripe/config", () => ({
  stripeWebhookSecret: "whsec_test_secret",
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "stripe_webhook_events") {
        return { insert: webhookEventsInsertMock, delete: () => ({ eq: webhookEventsDeleteEqMock }) };
      }
      if (table === "subscriptions") {
        return { select: () => ({ eq: () => ({ maybeSingle: subscriptionSelectMaybeSingleMock }) }) };
      }
      throw new Error(`unexpected table ${table}`);
    },
  }),
}));

vi.mock("@/lib/stripe/sync", () => ({
  resolveClientId: resolveClientIdMock,
  syncSubscriptionFromStripe: syncSubscriptionFromStripeMock,
  syncPaymentFromInvoice: syncPaymentFromInvoiceMock,
}));

import { POST } from "@/app/api/stripe/webhook/route";

function makeRequest(body: string, signature: string | null) {
  const headers = new Headers();
  if (signature !== null) headers.set("stripe-signature", signature);
  return new Request("http://localhost:3000/api/stripe/webhook", { method: "POST", body, headers });
}

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    constructEventMock.mockReset();
    subscriptionsRetrieveMock.mockReset();
    webhookEventsInsertMock.mockReset();
    webhookEventsDeleteEqMock.mockReset();
    subscriptionSelectMaybeSingleMock.mockReset();
    resolveClientIdMock.mockReset();
    syncSubscriptionFromStripeMock.mockReset();
    syncPaymentFromInvoiceMock.mockReset();
    webhookEventsInsertMock.mockResolvedValue({ error: null });
  });

  it("rejects a request with no Stripe-Signature header", async () => {
    const response = await POST(makeRequest("{}", null));
    expect(response.status).toBe(400);
    expect(constructEventMock).not.toHaveBeenCalled();
  });

  it("rejects a request with an invalid signature", async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error("invalid signature");
    });
    const response = await POST(makeRequest("{}", "t=1,v1=bad"));
    expect(response.status).toBe(400);
    expect(webhookEventsInsertMock).not.toHaveBeenCalled();
  });

  it("acknowledges a duplicate event without reprocessing it", async () => {
    constructEventMock.mockReturnValue({
      id: "evt_dup_1",
      type: "customer.subscription.updated",
      data: { object: { id: "sub_1", metadata: {} } },
    });
    webhookEventsInsertMock.mockResolvedValue({ error: { code: "23505" } });

    const response = await POST(makeRequest("{}", "t=1,v1=valid"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ received: true, duplicate: true });
    expect(resolveClientIdMock).not.toHaveBeenCalled();
    expect(syncSubscriptionFromStripeMock).not.toHaveBeenCalled();
  });

  it("syncs the subscription on customer.subscription.created", async () => {
    const subscriptionObject = { id: "sub_1", metadata: { feaseweb_client_id: "client-1" } };
    constructEventMock.mockReturnValue({
      id: "evt_1",
      type: "customer.subscription.created",
      data: { object: subscriptionObject },
    });
    resolveClientIdMock.mockResolvedValue("client-1");

    const response = await POST(makeRequest("{}", "t=1,v1=valid"));
    expect(response.status).toBe(200);
    expect(resolveClientIdMock).toHaveBeenCalledWith(subscriptionObject);
    expect(syncSubscriptionFromStripeMock).toHaveBeenCalledWith(subscriptionObject, "client-1");
  });

  it("syncs a paid invoice as a successful payment", async () => {
    const invoiceObject = {
      id: "in_1",
      parent: { subscription_details: { subscription: "sub_1" } },
      amount_paid: 4900,
      currency: "eur",
      lines: { data: [] },
    };
    constructEventMock.mockReturnValue({ id: "evt_2", type: "invoice.paid", data: { object: invoiceObject } });
    subscriptionsRetrieveMock.mockResolvedValue({ id: "sub_1", metadata: { feaseweb_client_id: "client-1" } });
    resolveClientIdMock.mockResolvedValue("client-1");
    subscriptionSelectMaybeSingleMock.mockResolvedValue({ data: { id: "subscription-row-1" } });

    const response = await POST(makeRequest("{}", "t=1,v1=valid"));
    expect(response.status).toBe(200);
    expect(syncPaymentFromInvoiceMock).toHaveBeenCalledWith(invoiceObject, "client-1", "subscription-row-1", "paye");
  });

  it("syncs a failed invoice as a failed payment", async () => {
    const invoiceObject = {
      id: "in_2",
      parent: { subscription_details: { subscription: "sub_1" } },
      amount_due: 4900,
      currency: "eur",
      lines: { data: [] },
    };
    constructEventMock.mockReturnValue({
      id: "evt_3",
      type: "invoice.payment_failed",
      data: { object: invoiceObject },
    });
    subscriptionsRetrieveMock.mockResolvedValue({ id: "sub_1", metadata: { feaseweb_client_id: "client-1" } });
    resolveClientIdMock.mockResolvedValue("client-1");
    subscriptionSelectMaybeSingleMock.mockResolvedValue({ data: { id: "subscription-row-1" } });

    const response = await POST(makeRequest("{}", "t=1,v1=valid"));
    expect(response.status).toBe(200);
    expect(syncPaymentFromInvoiceMock).toHaveBeenCalledWith(invoiceObject, "client-1", "subscription-row-1", "echoue");
  });

  it("releases the idempotency claim when processing fails so Stripe can retry", async () => {
    const subscriptionObject = { id: "sub_retry", metadata: { feaseweb_client_id: "client-1" } };
    constructEventMock.mockReturnValue({
      id: "evt_retry",
      type: "customer.subscription.updated",
      data: { object: subscriptionObject },
    });
    resolveClientIdMock.mockResolvedValue("client-1");
    syncSubscriptionFromStripeMock.mockRejectedValueOnce(new Error("database unavailable"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(makeRequest("{}", "t=1,v1=valid"));

    expect(response.status).toBe(500);
    expect(webhookEventsDeleteEqMock).toHaveBeenCalledWith("stripe_event_id", "evt_retry");
    errorSpy.mockRestore();
  });
});
