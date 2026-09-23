import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { getSafeAppUrl } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const stripe = getStripe();
  const safeAppUrl = getSafeAppUrl();
  if (!stripe || !safeAppUrl) return NextResponse.json({ error: "Stripe n'est pas configuré." }, { status: 503 });

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const { data: client } = await supabase.from("clients").select("id").eq("user_id", user.id).maybeSingle();
  if (!client) return NextResponse.json({ error: "Aucun client FeaseWeb associé à ce compte." }, { status: 404 });

  // Read via the admin client: external_customer_id is server-only data,
  // not something the browser should ever see or supply.
  const admin = createAdminClient();
  const { data: sub } = admin
    ? await admin.from("subscriptions").select("external_customer_id").eq("client_id", client.id).maybeSingle()
    : { data: null };
  if (!sub?.external_customer_id) {
    return NextResponse.json({ error: "Aucun abonnement Stripe pour ce client." }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.external_customer_id,
    return_url: `${safeAppUrl}/espace-client`,
  });

  return NextResponse.json({ url: session.url });
}
