import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { clientUpdateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const parsed = clientUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Mise à jour invalide." }, { status: 422 });
  const { data: client } = await supabase.from("clients").select("id").eq("id", parsed.data.client_id).maybeSingle();
  if (!client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
  if (parsed.data.site_id) {
    const { data: site } = await supabase.from("sites").select("id").eq("id", parsed.data.site_id).eq("client_id", parsed.data.client_id).maybeSingle();
    if (!site) return NextResponse.json({ error: "Site invalide pour ce client." }, { status: 422 });
  }
  const { data, error } = await supabase.from("client_updates").insert({ ...parsed.data, created_by: auth.user.id }).select("id").single();
  if (error) { console.error("client_update_create_failed", error.code); return NextResponse.json({ error: "Impossible d'enregistrer la mise à jour." }, { status: 500 }); }
  await supabase.from("activity_log").insert({ actor_id: auth.user.id, entity_type: "client_update", entity_id: data.id, message: "Mise à jour client créée." });
  return NextResponse.json({ ok: true, id: data.id });
}
