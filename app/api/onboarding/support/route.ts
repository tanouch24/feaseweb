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
  const { error } = await supabase!.from("project_intakes").update({ support_message: parsed.data.message, support_requested_at: new Date().toISOString() }).eq("user_id", current.user.id);
  if (error) return NextResponse.json({ error: "Impossible d'envoyer votre demande." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
