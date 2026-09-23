import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
const clientRowMock = vi.fn();
const subscriptionRowMock = vi.fn();
const portalSessionsCreate = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    from: (table: string) => {
      if (table !== "clients") throw new Error(`unexpected table ${table}`);
      return { select: () => ({ eq: () => ({ maybeSingle: clientRowMock }) }) };
    },
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table !== "subscriptions") throw new Error(`unexpected table ${table}`);
      return { select: () => ({ eq: () => ({ maybeSingle: subscriptionRowMock }) }) };
    },
  }),
}));

vi.mock("@/lib/stripe/server", () => ({
  getStripe: () => ({ billingPortal: { sessions: { create: portalSessionsCreate } } }),
}));

vi.mock("@/lib/stripe/config", () => ({
  appUrl: "http://localhost:3000",
  getSafeAppUrl: () => "http://localhost:3000",
}));

import { POST } from "@/app/api/billing/portal/route";

describe("POST /api/billing/portal", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    clientRowMock.mockReset();
    subscriptionRowMock.mockReset();
    portalSessionsCreate.mockReset();
  });

  it("rejects an unauthenticated request", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const response = await POST();
    expect(response.status).toBe(401);
    expect(portalSessionsCreate).not.toHaveBeenCalled();
  });

  it("rejects a user with no FeaseWeb client record", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    clientRowMock.mockResolvedValue({ data: null });
    const response = await POST();
    expect(response.status).toBe(404);
    expect(portalSessionsCreate).not.toHaveBeenCalled();
  });

  it("handles a client with no Stripe Customer cleanly", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    clientRowMock.mockResolvedValue({ data: { id: "client-1" } });
    subscriptionRowMock.mockResolvedValue({ data: null });
    const response = await POST();
    expect(response.status).toBe(404);
    expect(portalSessionsCreate).not.toHaveBeenCalled();
  });

  it("creates a Billing Portal session for the client's Stripe Customer", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    clientRowMock.mockResolvedValue({ data: { id: "client-1" } });
    subscriptionRowMock.mockResolvedValue({ data: { external_customer_id: "cus_test_1" } });
    portalSessionsCreate.mockResolvedValue({ url: "https://billing.stripe.com/test-portal" });

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.url).toBe("https://billing.stripe.com/test-portal");
    expect(portalSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_test_1", return_url: "http://localhost:3000/espace-client" })
    );
  });
});
