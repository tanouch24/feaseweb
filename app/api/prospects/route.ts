import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prospectInputSchema } from "@/lib/validation";

const recentSubmissions = new Map<string, number>();

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  const parsed = prospectInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Certains champs sont invalides.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  if (parsed.data.website) return NextResponse.json({ ok: true });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const last = recentSubmissions.get(ip);
  if (last && now - last < 30_000) return NextResponse.json({ error: "Merci de patienter avant de renvoyer une demande." }, { status: 429 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Le formulaire n'est pas encore configuré côté serveur." }, { status: 503 });
  const { data, error } = await supabase.from("prospects").insert({ first_name: parsed.data.firstName, last_name: parsed.data.lastName, company: parsed.data.company, email: parsed.data.email, phone: parsed.data.phone ?? null, activity: parsed.data.activity ?? null, city: parsed.data.city ?? null, existing_site_url: parsed.data.existingSiteUrl ?? null, has_existing_site: parsed.data.hasExistingSite, objective: parsed.data.objective ?? null, message: parsed.data.message ?? null, source: parsed.data.source, privacy_consent: parsed.data.privacyConsent, privacy_consent_at: new Date().toISOString(), privacy_policy_version: parsed.data.privacyPolicyVersion }).select("id").single();
  if (error) { console.error("prospect_insert_failed", error.code); return NextResponse.json({ error: "Impossible d'enregistrer la demande pour le moment." }, { status: 500 }); }
  recentSubmissions.set(ip, now);
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
