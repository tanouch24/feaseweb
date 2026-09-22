import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin(); if ("response" in auth) return auth.response;
  const supabase = await createClient(); if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const { id } = await params; const { data, error } = await supabase.rpc("convert_prospect", { p_prospect_id: id });
  if (error) { console.error("prospect_conversion_failed", error.code); return NextResponse.json({ error: "Impossible de convertir ce prospect." }, { status: error.code === "42501" ? 403 : 500 }); }
  return NextResponse.json({ ok: true, result: data, actor: auth.user.id });
}
