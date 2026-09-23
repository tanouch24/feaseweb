import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Maps every Stripe subscription status to the French business-status
 * vocabulary already used across the schema. Stripe's current_period_start
 * /end live on the subscription ITEM in this API version, not on the
 * subscription object itself (that moved with multi-item subscription
 * support) — syncSubscription reads it from items.data[0] accordingly.
 */
const STATUS_MAP: Record<Stripe.Subscription.Status, string> = {
  active: "actif",
  trialing: "essai",
  incomplete: "incomplet",
  incomplete_expired: "incomplet_expire",
  past_due: "retard",
  unpaid: "impaye",
  canceled: "annule",
  paused: "en_pause",
};

export function mapSubscriptionStatus(status: Stripe.Subscription.Status): string {
  return STATUS_MAP[status] ?? "incomplet";
}

function resolvePeriodEnd(subscription: Stripe.Subscription): string | null {
  const item = subscription.items.data[0];
  const periodEnd = item?.current_period_end;
  return typeof periodEnd === "number" ? new Date(periodEnd * 1000).toISOString() : null;
}

/**
 * Resolves the FeaseWeb client_id for a Stripe subscription: prefers the
 * feaseweb_client_id metadata set at checkout time (self-contained on the
 * Stripe object), falling back to looking up our own subscriptions row by
 * the Stripe customer id if metadata is ever missing.
 */
export async function resolveClientId(subscription: Stripe.Subscription): Promise<string | null> {
  const fromMetadata = subscription.metadata?.feaseweb_client_id;
  if (fromMetadata) return fromMetadata;

  const projectId = subscription.metadata?.feaseweb_project_intake_id;
  if (projectId) return ensureClientForProject(projectId);

  const admin = createAdminClient();
  if (!admin) return null;
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const { data } = await admin
    .from("subscriptions")
    .select("client_id")
    .eq("external_customer_id", customerId)
    .maybeSingle();
  return data?.client_id ?? null;
}

export async function ensureClientForProject(projectId: string): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase admin client not configured.");
  const { data: project, error: projectError } = await admin.from("project_intakes").select("*").eq("id", projectId).maybeSingle();
  if (projectError || !project) return null;
  if (project.client_id) return project.client_id;
  const { data: existing } = await admin.from("clients").select("id").eq("user_id", project.user_id).maybeSingle();
  let clientId = existing?.id as string | undefined;
  if (!clientId) {
    const created = await admin.from("clients").insert({ user_id: project.user_id, first_name: project.first_name, last_name: project.last_name, company: project.company, email: project.email, phone: project.phone, status: "actif", started_at: new Date().toISOString(), access_status: "actif", activated_at: new Date().toISOString() }).select("id").single();
    if (created.error?.code === "23505") {
      const retry = await admin.from("clients").select("id").eq("user_id", project.user_id).single();
      clientId = retry.data?.id;
    } else if (created.error) throw created.error;
    else clientId = created.data.id;
  }
  if (!clientId) return null;
  const { data: site } = await admin.from("sites").select("id").eq("client_id", clientId).maybeSingle();
  if (!site) {
    const slug = `${String(project.company).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "site"}-${clientId.slice(0, 8)}`;
    await admin.from("sites").insert({ client_id: clientId, name: project.company, slug, status: "a_preparer" });
  }
  await admin.from("profiles").update({ role: "client" }).eq("id", project.user_id);
  if (project.prospect_id) await admin.from("prospects").update({ status: "gagne" }).eq("id", project.prospect_id);
  await admin.from("project_intakes").update({ client_id: clientId, project_status: "subscription_active", completed_at: project.completed_at ?? new Date().toISOString() }).eq("id", projectId);
  return clientId;
}

/**
 * Upserts a subscriptions row from a real Stripe Subscription object.
 * Keyed on client_id (unique per subscriptions_client_id_key), so this is
 * safe to call repeatedly from any webhook event without ever creating a
 * second row for the same client.
 */
export async function syncSubscriptionFromStripe(subscription: Stripe.Subscription, clientId: string) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase admin client not configured.");

  const item = subscription.items.data[0];
  const priceId = typeof item?.price === "string" ? item.price : item?.price?.id ?? null;

  const { error } = await admin
    .from("subscriptions")
    .upsert(
      {
        client_id: clientId,
        provider: "stripe",
        external_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
        external_subscription_id: subscription.id,
        external_price_id: priceId,
        amount_cents: item?.price?.unit_amount ?? 4900,
        currency: (item?.price?.currency ?? "eur").toUpperCase(),
        status: mapSubscriptionStatus(subscription.status),
        started_at: subscription.start_date ? new Date(subscription.start_date * 1000).toISOString() : null,
        next_billing_at: resolvePeriodEnd(subscription),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      },
      { onConflict: "client_id" }
    );

  if (error) throw error;
}

/**
 * Upserts a payments row from a Stripe Invoice, keyed on external_reference
 * (unique) so a redelivered invoice.paid/payment_failed event never creates
 * a duplicate payment row.
 */
export async function syncPaymentFromInvoice(
  invoice: Stripe.Invoice,
  clientId: string,
  subscriptionRowId: string | null,
  status: "paye" | "en_attente" | "echoue" | "rembourse"
) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Supabase admin client not configured.");

  const periodLine = invoice.lines?.data?.[0]?.period;

  const { error } = await admin.from("payments").upsert(
    {
      client_id: clientId,
      subscription_id: subscriptionRowId,
      amount_cents: invoice.amount_paid || invoice.amount_due || 0,
      currency: invoice.currency.toUpperCase(),
      status,
      invoice_reference: invoice.number ?? invoice.id,
      period_start: periodLine ? new Date(periodLine.start * 1000).toISOString().slice(0, 10) : null,
      period_end: periodLine ? new Date(periodLine.end * 1000).toISOString().slice(0, 10) : null,
      provider: "stripe",
      external_reference: invoice.id,
    },
    { onConflict: "external_reference" }
  );

  if (error) throw error;
}

export async function getSubscriptionRowByClientId(clientId: string) {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin.from("subscriptions").select("id").eq("client_id", clientId).maybeSingle();
  return data ?? null;
}
