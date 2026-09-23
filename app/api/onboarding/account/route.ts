import { NextResponse } from "next/server";
import { accountCreationSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSafeAppUrl } from "@/lib/stripe/config";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const parsed = accountCreationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    const message = field === "privacyConsent" ? "Vous devez accepter l'utilisation de vos informations pour créer votre espace." : field === "phone" ? "Veuillez saisir un numéro de téléphone valide." : field === "confirmation" ? "Les deux mots de passe doivent correspondre." : "Vérifiez les informations saisies.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
  const { data: existing } = await supabase.auth.getUser();
  if (existing.user) return NextResponse.json({ error: "Un compte est déjà connecté." }, { status: 409 });
  const appUrl = getSafeAppUrl();
  if (!appUrl) return NextResponse.json({ error: "Configuration de l'application incomplète." }, { status: 503 });
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { first_name: parsed.data.firstName, last_name: parsed.data.lastName }, emailRedirectTo: `${appUrl}/auth/callback?next=/creer-mon-site` },
  });
  if (error || !data.user) return NextResponse.json({ error: "Impossible de créer cet espace. Vérifiez les informations saisies." }, { status: 400 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuration serveur incomplète." }, { status: 503 });
  const profile = await admin.from("profiles").update({ role: "prospect", first_name: parsed.data.firstName, last_name: parsed.data.lastName, email: parsed.data.email }).eq("id", data.user.id);
  if (profile.error) return NextResponse.json({ error: "Impossible de préparer l'espace." }, { status: 500 });
  const prospect = await admin.from("prospects").insert({ first_name: parsed.data.firstName, last_name: parsed.data.lastName, company: parsed.data.company, email: parsed.data.email, phone: parsed.data.phone ?? null, source: "Tunnel Créer mon site", status: "nouveau", privacy_consent: true, privacy_consent_at: new Date().toISOString() }).select("id").single();
  if (prospect.error) return NextResponse.json({ error: "Impossible de préparer le dossier." }, { status: 500 });
  const intake = await admin.from("project_intakes").upsert({ user_id: data.user.id, prospect_id: prospect.data.id, first_name: parsed.data.firstName, last_name: parsed.data.lastName, company: parsed.data.company, email: parsed.data.email, phone: parsed.data.phone ?? null }, { onConflict: "user_id" });
  if (intake.error) return NextResponse.json({ error: "Impossible de préparer le projet." }, { status: 500 });
  if (!data.session) return NextResponse.json({ needsConfirmation: true });
  return NextResponse.json({ redirect: "/creer-mon-site" });
}
