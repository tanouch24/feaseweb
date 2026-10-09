import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { needsBillingAttention, subscriptionState } from "@/lib/subscription-state";

describe("subscriptionState", () => {
  it("no longer reports a cancelled subscription as active", () => {
    expect(subscriptionState({ status: "annule", canceled_at: "2026-10-01T00:00:00Z" }, true).kind).toBe("canceled");
  });
  it("flags unpaid and past-due subscriptions", () => {
    expect(subscriptionState({ status: "retard" }, true).kind).toBe("payment_issue");
    expect(subscriptionState({ status: "impaye" }, true).kind).toBe("payment_issue");
  });
  it("shows a scheduled cancellation", () => {
    expect(subscriptionState({ status: "actif", cancel_at_period_end: true, next_billing_at: "2026-11-01T00:00:00Z" }, true)).toEqual({ kind: "ending", endsAt: "2026-11-01T00:00:00Z" });
  });
  it("falls back to the payment history when no subscription row exists", () => {
    expect(subscriptionState(null, true).kind).toBe("active");
    expect(subscriptionState(null, false).kind).toBe("none");
  });
  it("tells the admin which subscriptions need attention", () => {
    expect(needsBillingAttention("annule")).toBe(true);
    expect(needsBillingAttention("actif")).toBe(false);
  });
});

describe("ClientSpaceSections subscription card", async () => {
  const { ClientSpaceSections } = await import("@/components/client/ClientSpaceSections");
  const base = {
    client: null, profile: null, project: null, site: null, updates: [], requests: [], seoActions: [],
    payments: [{ id: "p1", amount_cents: 4900, status: "paye", created_at: "2026-09-24T10:00:00.000Z", invoice_reference: null, period_start: null, period_end: null }],
  };
  it("asks the client to fix a failed payment and offers the billing portal", () => {
    render(<ClientSpaceSections {...base} subscription={{ status: "retard" }} />);
    expect(screen.getByText("Paiement à régulariser")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gérer mon abonnement" })).toBeInTheDocument();
    expect(screen.queryByText("Abonnement actif ✓")).not.toBeInTheDocument();
  });
});
