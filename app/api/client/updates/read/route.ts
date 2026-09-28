import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const current = await getAuthenticatedProfile();
  if (!current.configured) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  if (!current.user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  if (current.role !== "client") return NextResponse.json({ error: "Accès interdit." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  const { data: client } = await admin.from("clients").select("id").eq("user_id", current.user.id).maybeSingle();
  if (!client) return NextResponse.json({ error: "Accès interdit." }, { status: 403 });
  const { error } = await admin.from("client_updates").update({ read_at: new Date().toISOString() }).eq("client_id", client.id).eq("visible_to_client", true).is("read_at", null);
  if (error) {
    console.error("client_updates_read_failed", error.code);
    return NextResponse.json({ error: "Impossible d'actualiser le suivi." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
