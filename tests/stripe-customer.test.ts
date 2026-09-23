import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const stripeCustomersCreate = vi.fn();
vi.mock("@/lib/stripe/server", () => ({
  getStripe: () => ({ customers: { create: stripeCustomersCreate } }),
}));

const supabaseState: { existing: { external_customer_id: string | null } | null } = { existing: null };
const upsertSpy = vi.fn(async () => ({ error: null }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table !== "subscriptions") throw new Error(`unexpected table ${table}`);
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: supabaseState.existing }),
          }),
        }),
        upsert: upsertSpy,
      };
    },
  }),
}));

import { ensureStripeCustomer } from "@/lib/stripe/customer";

describe("ensureStripeCustomer", () => {
  beforeEach(() => {
    stripeCustomersCreate.mockReset();
    upsertSpy.mockClear();
    supabaseState.existing = null;
  });

  it("reuses an existing Stripe customer instead of creating a new one", async () => {
    supabaseState.existing = { external_customer_id: "cus_existing_123" };
    const id = await ensureStripeCustomer({ id: "client-1", email: "a@example.com", company: "ACME" });
    expect(id).toBe("cus_existing_123");
    expect(stripeCustomersCreate).not.toHaveBeenCalled();
  });

  it("creates a Stripe customer and persists it when none exists yet", async () => {
    supabaseState.existing = null;
    stripeCustomersCreate.mockResolvedValue({ id: "cus_new_456" });
    const id = await ensureStripeCustomer({ id: "client-2", email: "b@example.com", company: "Other SARL" });
    expect(id).toBe("cus_new_456");
    expect(stripeCustomersCreate).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { feaseweb_client_id: "client-2" } }),
      { idempotencyKey: "feaseweb-customer-client-2" }
    );
    expect(upsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "client-2", external_customer_id: "cus_new_456" }),
      { onConflict: "client_id" }
    );
  });
});
