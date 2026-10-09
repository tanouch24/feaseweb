import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { appUrl, sendEmail } from "@/lib/emails";

/**
 * Invite un contact sans espace (demande de refonte, formulaire de contact)
 * à créer son espace FeaseWeb, seule porte d'entrée vers la configuration du
 * projet, le rendez-vous et le paiement.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const { id } = await params;
  const { data: prospect } = await admin.from("prospects").select("id, first_name, company, email, existing_site_url").eq("id", id).maybeSingle();
  if (!prospect?.email) return NextResponse.json({ error: "Contact introuvable ou sans e-mail." }, { status: 404 });
  const { data: intake } = await admin.from("project_intakes").select("id").eq("prospect_id", id).maybeSingle();
  if (intake) return NextResponse.json({ error: "Ce contact a déjà un espace FeaseWeb." }, { status: 409 });

  const sent = await sendEmail({ email: prospect.email, name: prospect.first_name }, "Votre projet de site avec FeaseWeb", {
    greetingName: prospect.first_name,
    title: "Créez votre espace pour lancer votre projet",
    paragraphs: [
      `Merci pour votre demande${prospect.company ? ` pour ${prospect.company}` : ""}. Pour préparer ${prospect.existing_site_url ? "la refonte de votre site" : "votre site"}, il nous faut quelques informations sur votre activité.`,
      "Créez votre espace FeaseWeb : cela prend deux minutes, et vous pourrez ensuite choisir un rendez-vous avec nous.",
      "La création ou la refonte est à 0 €. Vous voyez votre site avant de vous engager.",
    ],
    cta: { label: "Créer mon espace", url: appUrl("/creer-mon-site") },
  });
  if (!sent.ok) {
    return NextResponse.json({ error: sent.reason === "not_configured" ? "L'envoi d'e-mails (Brevo) n'est pas configuré." : "L'e-mail n'a pas pu être envoyé." }, { status: 502 });
  }
  await admin.from("internal_notes").insert({ author_id: auth.user.id, prospect_id: id, body: "Invitation à créer son espace envoyée par e-mail." });
  await admin.from("activity_log").insert({ actor_id: auth.user.id, entity_type: "prospect", entity_id: id, message: "Invitation à créer son espace envoyée." });
  return NextResponse.json({ ok: true });
}
