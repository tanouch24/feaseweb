import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { sitePatchSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin(); if ("response" in auth) return auth.response;
  const supabase = await createClient(); if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const parsed = sitePatchSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Données site invalides." }, { status: 422 });
  const { id } = await params; const patch = { preview_url: parsed.data.previewUrl, production_url: parsed.data.productionUrl, domain: parsed.data.domain, repository: parsed.data.repository, hosting_provider: parsed.data.hostingProvider, status: parsed.data.status, launched_at: parsed.data.status === "actif" ? new Date().toISOString() : undefined }; const { error } = await supabase.from("sites").update(patch).eq("id", id); if (error) return NextResponse.json({ error: "Impossible de modifier le site." }, { status: 500 });
  await supabase.from("activity_log").insert({ actor_id: auth.user.id, entity_type: "site", entity_id: id, message: "Site modifié." }); return NextResponse.json({ ok: true });
}
