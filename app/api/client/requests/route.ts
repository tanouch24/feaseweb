import { NextResponse } from "next/server";
import { requireClient } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { clientRequestSchema } from "@/lib/validation";
import { sendClientRequestEmail } from "@/lib/brevo";
import { authenticatedRateLimitKey, checkRateLimit, rateLimitResponse, rateLimitUnavailableResponse } from "@/lib/rate-limit";

function monthWindow() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function POST(request: Request) {
  const current = await requireClient();
  const limit = await checkRateLimit({ category: "client-request", key: authenticatedRateLimitKey(current.user.id), limit: 3, windowSeconds: 3600 });
  if (limit.status === "limited") return rateLimitResponse(limit.retryAfter);
  if (limit.status === "unavailable") return rateLimitUnavailableResponse();
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const parsed = clientRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Demande invalide." }, { status: 422 });
  const { data: client } = await supabase.from("clients").select("id, email, first_name").eq("user_id", current.user.id).maybeSingle();
  if (!client) return NextResponse.json({ error: "Aucun dossier client associé." }, { status: 404 });
  const window = monthWindow();
  const { count, error: countError } = await supabase.from("modification_requests").select("id", { count: "exact", head: true }).eq("client_id", client.id).gte("created_at", window.start).lt("created_at", window.end);
  if (countError) return NextResponse.json({ error: "Impossible de vérifier la limite mensuelle." }, { status: 500 });
  if ((count ?? 0) >= 1) return NextResponse.json({ error: "Votre demande mensuelle a déjà été utilisée. FeaseWeb reviendra vers vous depuis cet espace.", code: "monthly_limit_reached" }, { status: 409 });
  const { data: site } = await supabase.from("sites").select("id").eq("client_id", client.id).order("created_at").limit(1).maybeSingle();
  if (!site) return NextResponse.json({ error: "Aucun site associé à ce dossier." }, { status: 422 });
  const { data: created, error } = await supabase.from("modification_requests").insert({ client_id: client.id, site_id: site.id, title: parsed.data.title, category: parsed.data.category, message: parsed.data.message, priority: "normale" }).select("id, title").single();
  if (error || !created) return NextResponse.json({ error: "Impossible d'envoyer la demande." }, { status: 500 });
  const emailResult = client.email ? await sendClientRequestEmail({ firstName: client.first_name, email: client.email, title: created.title, status: "received" }) : { ok: false as const, reason: "not_configured" as const };
  return NextResponse.json({ ok: true, emailSent: emailResult.ok });
}
