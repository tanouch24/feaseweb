import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { prospectStatusSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin(); if ("response" in auth) return auth.response;
  const supabase = await createClient(); if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const parsed = prospectStatusSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Statut invalide." }, { status: 422 });
  const { id } = await params; const { error } = await supabase.from("prospects").update({ status: parsed.data.status }).eq("id", id); if (error) return NextResponse.json({ error: "Impossible de modifier le prospect." }, { status: 500 });
  await supabase.from("activity_log").insert({ actor_id: auth.user.id, entity_type: "prospect", entity_id: id, message: `Statut prospect → ${parsed.data.status}` });
  return NextResponse.json({ ok: true });
}
