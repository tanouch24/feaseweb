import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  getUserMock,
  clientRowMock,
  checkoutSessionsCreate,
  ensureStripeCustomerMock,
  getActiveOrPendingSubscriptionMock,
} = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  clientRowMock: vi.fn(),
  checkoutSessionsCreate: vi.fn(),
  ensureStripeCustomerMock: vi.fn(),
  getActiveOrPendingSubscriptionMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    from: (table: string) => {
      if (table !== "clients") throw new Error(`unexpected table ${table}`);
      return { select: () => ({ eq: () => ({ maybeSingle: clientRowMock }) }) };
    },
  }),
}));

vi.mock("@/lib/stripe/server", () => ({
  getStripe: () => ({ checkout: { sessions: { create: checkoutSessionsCreate } } }),
}));

vi.mock("@/lib/stripe/config", () => ({
  stripePriceId: "price_test_123",
  appUrl: "http://localhost:3000",
  getSafeAppUrl: () => "http://localhost:3000",
}));

vi.mock("@/lib/stripe/customer", () => ({
  ensureStripeCustomer: ensureStripeCustomerMock,
  getActiveOrPendingSubscription: getActiveOrPendingSubscriptionMock,
}));

import { POST } from "@/app/api/billing/checkout/route";

describe("POST /api/billing/checkout", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    clientRowMock.mockReset();
    checkoutSessionsCreate.mockReset();
    ensureStripeCustomerMock.mockReset();
    getActiveOrPendingSubscriptionMock.mockReset();
  });

  it("rejects an unauthenticated request", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const response = await POST();
    expect(response.status).toBe(401);
    expect(checkoutSessionsCreate).not.toHaveBeenCalled();
  });

  it("rejects a user with no FeaseWeb client record", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    clientRowMock.mockResolvedValue({ data: null });
    const response = await POST();
    expect(response.status).toBe(404);
    expect(checkoutSessionsCreate).not.toHaveBeenCalled();
  });

  it("refuses to create a second subscription when one already blocks", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    clientRowMock.mockResolvedValue({ data: { id: "client-1", email: "a@example.com", company: "ACME" } });
    getActiveOrPendingSubscriptionMock.mockResolvedValue({ id: "sub-1", status: "actif" });
    const response = await POST();
    expect(response.status).toBe(409);
    expect(ensureStripeCustomerMock).not.toHaveBeenCalled();
    expect(checkoutSessionsCreate).not.toHaveBeenCalled();
  });

  it("creates a Checkout Session with the server-imposed price and quantity", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    clientRowMock.mockResolvedValue({ data: { id: "client-1", email: "a@example.com", company: "ACME" } });
    getActiveOrPendingSubscriptionMock.mockResolvedValue(null);
    ensureStripeCustomerMock.mockResolvedValue("cus_test_1");
    checkoutSessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/test-session" });

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.url).toBe("https://checkout.stripe.com/test-session");
    expect(checkoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        customer: "cus_test_1",
        line_items: [{ price: "price_test_123", quantity: 1 }],
        success_url: "http://localhost:3000/espace-client?checkout=success",
        cancel_url: "http://localhost:3000/espace-client?checkout=cancelled",
        metadata: { feaseweb_client_id: "client-1" },
      })
    );
  });
});
