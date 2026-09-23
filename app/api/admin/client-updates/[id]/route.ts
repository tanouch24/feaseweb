import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { clientUpdatePatchSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const parsed = clientUpdatePatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Mise à jour invalide." }, { status: 422 });
  const { id } = await params;
  const { data: current } = await supabase.from("client_updates").select("id, client_id").eq("id", id).maybeSingle();
  if (!current) return NextResponse.json({ error: "Mise à jour introuvable." }, { status: 404 });
  if (parsed.data.siteId) {
    const { data: site } = await supabase.from("sites").select("id").eq("id", parsed.data.siteId).eq("client_id", current.client_id).maybeSingle();
    if (!site) return NextResponse.json({ error: "Site invalide pour ce client." }, { status: 422 });
  }
  const { error } = await supabase.from("client_updates").update(parsed.data).eq("id", id);
  if (error) { console.error("client_update_update_failed", error.code); return NextResponse.json({ error: "Impossible de modifier la mise à jour." }, { status: 500 }); }
  await supabase.from("activity_log").insert({ actor_id: auth.user.id, entity_type: "client_update", entity_id: id, message: "Mise à jour client modifiée." });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const { id } = await params;
  const { data: current } = await supabase.from("client_updates").select("id").eq("id", id).maybeSingle();
  if (!current) return NextResponse.json({ error: "Mise à jour introuvable." }, { status: 404 });
  const { error } = await supabase.from("client_updates").delete().eq("id", id);
  if (error) { console.error("client_update_delete_failed", error.code); return NextResponse.json({ error: "Impossible de supprimer la mise à jour." }, { status: 500 }); }
  await supabase.from("activity_log").insert({ actor_id: auth.user.id, entity_type: "client_update", entity_id: id, message: "Mise à jour client supprimée." });
  return NextResponse.json({ ok: true });
}
