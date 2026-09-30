import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedProfile } from "@/lib/authz";
import { supportMessageSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const current = await getAuthenticatedProfile();
  if (!current.user || (current.role !== "prospect" && current.role !== "client")) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const parsed = supportMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Votre message est invalide." }, { status: 422 });
  const supabase = await createClient();
  const { data: intake, error: intakeError } = await supabase!.from("project_intakes").select("id").eq("user_id", current.user.id).maybeSingle();
  if (intakeError) return NextResponse.json({ error: "Impossible de retrouver votre projet." }, { status: 500 });
  if (!intake) return NextResponse.json({ error: "Commencez votre projet avant d'envoyer un message." }, { status: 404 });

  const { error: messageError } = await supabase!.from("project_messages").insert({ project_intake_id: intake.id, sender_type: "client", message: parsed.data.message });
  if (!messageError) return NextResponse.json({ ok: true });

  // Compatibility while the local migration has not yet reached an environment.
  // Once project_messages exists, every new message uses the durable history.
  if (messageError.code !== "42P01") return NextResponse.json({ error: "Impossible d'envoyer votre demande." }, { status: 500 });
  const { error: legacyError } = await supabase!.from("project_intakes").update({ support_message: parsed.data.message, support_requested_at: new Date().toISOString() }).eq("id", intake.id).eq("user_id", current.user.id);
  if (legacyError) return NextResponse.json({ error: "Impossible d'envoyer votre demande." }, { status: 500 });
  return NextResponse.json({ ok: true, legacy: true });
}
