import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const { id } = await params;
  const { error } = await supabase.from("project_messages").update({ read_at: new Date().toISOString() }).eq("id", id).is("read_at", null);
  if (error) return NextResponse.json({ error: "Impossible de marquer le message comme lu." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
