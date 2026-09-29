import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const current = await getAuthenticatedProfile();
  if (!current.configured) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  if (!current.user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  if (current.role !== "client") return NextResponse.json({ error: "Accès interdit." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  const body = await request.json().catch(() => null) as { updateId?: unknown } | null;
  const updateId = typeof body?.updateId === "string" ? body.updateId.trim() : "";
  if (!updateId || !/^[0-9a-f-]{36}$/i.test(updateId)) return NextResponse.json({ error: "Notification invalide." }, { status: 400 });
  const { data: client } = await admin.from("clients").select("id").eq("user_id", current.user.id).maybeSingle();
  if (!client) return NextResponse.json({ error: "Accès interdit." }, { status: 403 });
  const { data: update, error } = await admin.from("client_updates").update({ read_at: new Date().toISOString() }).eq("id", updateId).eq("client_id", client.id).eq("visible_to_client", true).is("read_at", null).select("id").maybeSingle();
  if (error) {
    console.error("client_updates_read_failed", error.code);
    return NextResponse.json({ error: "Impossible d'actualiser le suivi." }, { status: 500 });
  }
  if (!update) return NextResponse.json({ error: "Notification introuvable." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
