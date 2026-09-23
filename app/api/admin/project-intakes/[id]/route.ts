import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { projectStatusSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin(); if ("response" in auth) return auth.response;
  const parsed = projectStatusSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Étape invalide." }, { status: 422 });
  const { id } = await params;
  const admin = createAdminClient(); if (!admin) return NextResponse.json({ error: "Configuration serveur incomplète." }, { status: 503 });
  const { data, error } = await admin.from("project_intakes").update({ project_status: parsed.data.status }).eq("id", id).select("id, project_status").single();
  if (error) return NextResponse.json({ error: "Projet introuvable ou modification impossible." }, { status: 400 });
  return NextResponse.json({ project: data });
}
