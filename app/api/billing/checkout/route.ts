import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { getSafeAppUrl, stripePriceId } from "@/lib/stripe/config";
import { ensureStripeCustomer, getActiveOrPendingSubscription } from "@/lib/stripe/customer";

/**
 * Creates a Stripe Checkout Session for the single FeaseWeb subscription
 * offer. The server decides everything: the price, the quantity, the
 * customer. Nothing accepted from the request body — there isn't one.
 */
export async function POST() {
  const stripe = getStripe();
  const safeAppUrl = getSafeAppUrl();
  if (!stripe || !stripePriceId || !safeAppUrl) {
    return NextResponse.json({ error: "Stripe n'est pas configuré." }, { status: 503 });
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const { data: client } = await supabase
    .from("clients")
    .select("id, email, company")
    .eq("user_id", user.id)
    .maybeSingle();
  let project: { id: string; email: string; company: string; current_step: number; project_status: string } | null = null;
  if (!client) {
    try { const result = await supabase.from("project_intakes").select("id, email, company, current_step, project_status").eq("user_id", user.id).maybeSingle(); project = result.data; } catch { project = null; }
  }
  if (!client && !project) return NextResponse.json({ error: "Aucun projet FeaseWeb associé à ce compte." }, { status: 404 });

  if (project && (project.current_step < 8 || project.project_status === "subscription_active")) return NextResponse.json({ error: "Terminez la configuration de votre projet avant de démarrer." }, { status: 409 });

  const blocking = client ? await getActiveOrPendingSubscription(client.id) : null;
  if (blocking) {
    return NextResponse.json(
      { error: "Un abonnement existe déjà pour ce client.", status: blocking.status },
      { status: 409 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    ...(client ? { customer: await ensureStripeCustomer(client) } : { customer_email: project!.email }),
    line_items: [{ price: stripePriceId, quantity: 1 }],
    success_url: `${safeAppUrl}/espace-client?checkout=success`,
    cancel_url: `${safeAppUrl}/espace-client?checkout=cancelled`,
    metadata: client ? { feaseweb_client_id: client.id } : { feaseweb_project_intake_id: project!.id, feaseweb_user_id: user.id },
    subscription_data: { metadata: client ? { feaseweb_client_id: client.id } : { feaseweb_project_intake_id: project!.id, feaseweb_user_id: user.id } },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Impossible de créer la session de paiement." }, { status: 500 });
  }
  return NextResponse.json({ url: session.url });
}
