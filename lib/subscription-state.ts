/**
 * Traduit la ligne `subscriptions` (statuts Stripe mappés en français dans
 * lib/stripe/sync.ts) en un état lisible pour l'espace client et l'admin.
 */
export type SubscriptionRecord = {
  status: string | null;
  next_billing_at?: string | null;
  cancel_at_period_end?: boolean | null;
  canceled_at?: string | null;
} | null;

export type SubscriptionState =
  | { kind: "none" }
  | { kind: "active"; nextBillingAt: string | null }
  | { kind: "ending"; endsAt: string | null }
  | { kind: "payment_issue" }
  | { kind: "paused" }
  | { kind: "canceled"; canceledAt: string | null };

export function subscriptionState(subscription: SubscriptionRecord, hasPaidPayment: boolean): SubscriptionState {
  if (!subscription?.status) return hasPaidPayment ? { kind: "active", nextBillingAt: null } : { kind: "none" };
  switch (subscription.status) {
    case "actif":
    case "essai":
      return subscription.cancel_at_period_end
        ? { kind: "ending", endsAt: subscription.next_billing_at ?? null }
        : { kind: "active", nextBillingAt: subscription.next_billing_at ?? null };
    case "retard":
    case "impaye":
    case "incomplet":
      return { kind: "payment_issue" };
    case "en_pause":
      return { kind: "paused" };
    case "annule":
    case "incomplet_expire":
      return { kind: "canceled", canceledAt: subscription.canceled_at ?? null };
    default:
      return hasPaidPayment ? { kind: "active", nextBillingAt: null } : { kind: "none" };
  }
}

/** Abonnements qui demandent l'attention de FeaseWeb (tableau de bord admin). */
export function needsBillingAttention(status: string | null | undefined): boolean {
  return ["retard", "impaye", "incomplet", "annule", "incomplet_expire", "en_pause"].includes(status ?? "");
}
