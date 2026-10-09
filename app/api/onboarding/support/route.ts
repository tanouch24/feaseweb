import { NextResponse } from "next/server";
import { onProspectMessage } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedProfile } from "@/lib/authz";
import { supportMessageSchema } from "@/lib/validation";
import { authenticatedRateLimitKey, checkRateLimit, rateLimitResponse, rateLimitUnavailableResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const current = await getAuthenticatedProfile();
  if (!current.user || (current.role !== "prospect" && current.role !== "client")) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const limit = await checkRateLimit({ category: "support", key: authenticatedRateLimitKey(current.user.id), limit: 10, windowSeconds: 3600 });
  if (limit.status === "limited") return rateLimitResponse(limit.retryAfter);
  if (limit.status === "unavailable") return rateLimitUnavailableResponse();
  const parsed = supportMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Votre message est invalide." }, { status: 422 });
  const supabase = await createClient();
  const { data: intake, error: intakeError } = await supabase!.from("project_intakes").select("id, first_name, company, email").eq("user_id", current.user.id).maybeSingle();
  if (intakeError) return NextResponse.json({ error: "Impossible de retrouver votre projet." }, { status: 500 });
  if (!intake) return NextResponse.json({ error: "Commencez votre projet avant d'envoyer un message." }, { status: 404 });

  const { error: messageError } = await supabase!.from("project_messages").insert({ project_intake_id: intake.id, sender_type: "client", message: parsed.data.message });
  if (!messageError) {
    // Répondre clôt la demande d'information de FeaseWeb : sinon « FeaseWeb a
    // besoin de vous » restait affiché et masquait l'étape suivante (paiement).
    const admin = createAdminClient();
    if (admin) await admin.from("client_updates").update({ read_at: new Date().toISOString() }).eq("project_intake_id", intake.id).eq("update_type", "action_requise").is("read_at", null).or("action_type.is.null,action_type.eq.completer_informations");
    await onProspectMessage({ email: intake.email, firstName: intake.first_name, company: intake.company }, parsed.data.message);
    return NextResponse.json({ ok: true });
  }

  // Compatibility while the local migration has not yet reached an environment.
  // Once project_messages exists, every new message uses the durable history.
  if (messageError.code !== "42P01") return NextResponse.json({ error: "Impossible d'envoyer votre demande." }, { status: 500 });
  const { error: legacyError } = await supabase!.from("project_intakes").update({ support_message: parsed.data.message, support_requested_at: new Date().toISOString() }).eq("id", intake.id).eq("user_id", current.user.id);
  if (legacyError) return NextResponse.json({ error: "Impossible d'envoyer votre demande." }, { status: 500 });
  return NextResponse.json({ ok: true, legacy: true });
}
