import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { stripeWebhookSecret } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureClientForProject, resolveClientId, syncPaymentFromInvoice, syncSubscriptionFromStripe } from "@/lib/stripe/sync";

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);

/**
 * Resolves the Stripe subscription linked to an invoice. In this API
 * version, invoice.subscription no longer exists at the top level — the
 * link now lives at invoice.parent.subscription_details.subscription.
 */
function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const details = invoice.parent?.subscription_details;
  if (!details?.subscription) return null;
  return typeof details.subscription === "string" ? details.subscription : details.subscription.id;
}

async function fetchAndSyncSubscription(stripe: Stripe, subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const clientId = await resolveClientId(subscription);
  if (!clientId) return { subscription, clientId: null };
  await syncSubscriptionFromStripe(subscription, clientId);
  return { subscription, clientId };
}

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe || !stripeWebhookSecret) {
    return NextResponse.json({ error: "Stripe n'est pas configuré." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Signature manquante." }, { status: 400 });

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);
  } catch {
    // Never trust an unverified payload — reject outright, log nothing
    // sensitive, and never process the body.
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });

  // Idempotency: try to claim this event id first. A unique_violation means
  // we've already processed it — ack and stop, never re-run side effects.
  const { error: insertError } = await admin
    .from("stripe_webhook_events")
    .insert({ stripe_event_id: event.id, type: event.type });
  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("stripe_webhook_event_log_failed", insertError.code);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientId = session.metadata?.feaseweb_client_id ?? (session.metadata?.feaseweb_project_intake_id ? await ensureClientForProject(session.metadata.feaseweb_project_intake_id) : null);
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        if (clientId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncSubscriptionFromStripe(subscription, clientId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const clientId = await resolveClientId(subscription);
        if (clientId) await syncSubscriptionFromStripe(subscription, clientId);
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoiceSubscriptionId(invoice);
        if (subscriptionId) {
          const { clientId } = await fetchAndSyncSubscription(stripe, subscriptionId);
          if (clientId) {
            const { data: subRow } = await admin
              .from("subscriptions")
              .select("id")
              .eq("client_id", clientId)
              .maybeSingle();
            await syncPaymentFromInvoice(
              invoice,
              clientId,
              subRow?.id ?? null,
              event.type === "invoice.paid" ? "paye" : "echoue"
            );
          }
        }
        break;
      }
    }
  } catch (error) {
    await admin.from("stripe_webhook_events").delete().eq("stripe_event_id", event.id);
    console.error("stripe_webhook_processing_failed", event.type, error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json({ error: "Traitement impossible." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
