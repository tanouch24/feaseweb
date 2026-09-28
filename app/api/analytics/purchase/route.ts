import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { sendMetaConversionEvent } from "@/lib/meta-conversions";

export async function POST(request: Request) {
  const current = await getAuthenticatedProfile();
  if (!current.user || current.role !== "client") return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  const { data: client } = await supabase.from("clients").select("id, email").eq("user_id", current.user.id).maybeSingle();
  if (!client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
  const [{ data: subscription }, { data: payment }] = await Promise.all([
    supabase.from("subscriptions").select("status").eq("client_id", client.id).maybeSingle(),
    supabase.from("payments").select("id, external_reference, amount_cents, currency, status").eq("client_id", client.id).eq("status", "paye").order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (subscription?.status !== "actif" || !payment) return NextResponse.json({ error: "Paiement non confirmé." }, { status: 409 });
  const trackingEventId = `subscription_paid:${payment.external_reference ?? payment.id}`;
  void sendMetaConversionEvent({ eventName: "subscription_paid", eventId: trackingEventId, eventSourceUrl: request.url, userData: { email: client.email }, customData: { currency: "EUR", value: (payment.amount_cents ?? 4900) / 100 } });
  return NextResponse.json({ trackingEventId, transactionId: payment.external_reference ?? payment.id });
}
