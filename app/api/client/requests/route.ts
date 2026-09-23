import { NextResponse } from "next/server";
import { requireClient } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { clientRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const current = await requireClient();
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const parsed = clientRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Demande invalide." }, { status: 422 });
  const { data: client } = await supabase.from("clients").select("id").eq("user_id", current.user.id).maybeSingle();
  if (!client) return NextResponse.json({ error: "Aucun dossier client associé." }, { status: 404 });
  const { data: site } = await supabase.from("sites").select("id").eq("client_id", client.id).order("created_at").limit(1).maybeSingle();
  if (!site) return NextResponse.json({ error: "Aucun site associé à ce dossier." }, { status: 422 });
  const { error } = await supabase.from("modification_requests").insert({ client_id: client.id, site_id: site.id, title: parsed.data.title, category: parsed.data.category, message: parsed.data.message, priority: "normale" });
  if (error) return NextResponse.json({ error: "Impossible d'envoyer la demande." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
