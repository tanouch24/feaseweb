import "server-only";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type BillingClient = { id: string; email: string; company: string };

/**
 * Idempotent: reuses the client's existing Stripe Customer (read from
 * subscriptions.external_customer_id, keyed uniquely on client_id) rather
 * than creating a new one on every call — repeated clicks never produce
 * duplicate Stripe Customers for the same FeaseWeb client.
 */
export async function ensureStripeCustomer(client: BillingClient): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe n'est pas configuré.");
  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase admin client not configured.");

  const { data: existing } = await admin
    .from("subscriptions")
    .select("external_customer_id")
    .eq("client_id", client.id)
    .maybeSingle();

  if (existing?.external_customer_id) return existing.external_customer_id;

  const customer = await stripe.customers.create({
    email: client.email,
    name: client.company,
    metadata: { feaseweb_client_id: client.id },
  }, { idempotencyKey: `feaseweb-customer-${client.id}` });

  const { error } = await admin
    .from("subscriptions")
    .upsert({ client_id: client.id, provider: "stripe", external_customer_id: customer.id }, { onConflict: "client_id" });
  if (error) throw error;

  return customer.id;
}

/** Statuses that mean "this client already has a subscription in flight or
 * active" — used to refuse creating a second Checkout Session. */
const BLOCKING_STATUSES = new Set(["actif", "essai", "incomplet", "retard", "impaye", "en_pause"]);

export async function getActiveOrPendingSubscription(clientId: string) {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("subscriptions")
    .select("id, status, external_customer_id, external_subscription_id")
    .eq("client_id", clientId)
    .maybeSingle();
  if (!data) return null;
  return BLOCKING_STATUSES.has(data.status) ? data : null;
}
