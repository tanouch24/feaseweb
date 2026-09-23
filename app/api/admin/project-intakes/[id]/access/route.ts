import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { accessRequirementSchema } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin(); if ("response" in auth) return auth.response;
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ error: "Configuration serveur incomplète." }, { status: 503 });
  const { id } = await params; const { data, error } = await admin.from("project_access_requirements").select("*").eq("project_intake_id", id).order("category");
  if (error) return NextResponse.json({ error: "Accès techniques indisponibles." }, { status: 500 }); return NextResponse.json({ requirements: data ?? [] });
}
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin(); if ("response" in auth) return auth.response;
  const parsed = accessRequirementSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Statut invalide." }, { status: 422 });
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ error: "Configuration serveur incomplète." }, { status: 503 }); const { id } = await params;
  const { data, error } = await admin.from("project_access_requirements").upsert({ project_intake_id: id, category: parsed.data.category, status: parsed.data.status }, { onConflict: "project_intake_id,category" }).select("*").single();
  if (error) return NextResponse.json({ error: "Impossible d'enregistrer le statut." }, { status: 400 }); return NextResponse.json({ requirement: data });
}
