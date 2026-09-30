import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteCreateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuration serveur incomplète." }, { status: 503 });
  const parsed = siteCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dossier invalide." }, { status: 422 });
  const { data: intake } = await admin.from("project_intakes").select("id, client_id, company").eq("id", parsed.data.projectIntakeId).maybeSingle();
  if (!intake) return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });
  const { data: existing } = await admin.from("sites").select("id, project_intake_id, client_id, name, domain, production_url, status, created_at, launched_at").eq("project_intake_id", intake.id).order("created_at").limit(1).maybeSingle();
  if (existing) return NextResponse.json({ ok: true, site: existing });
  const { data: legacy } = intake.client_id ? await admin.from("sites").select("id, project_intake_id, client_id, name, domain, production_url, status, created_at, launched_at").eq("client_id", intake.client_id).order("created_at").limit(1).maybeSingle() : { data: null };
  if (legacy) {
    const { data: linked } = await admin.from("sites").update({ project_intake_id: intake.id }).eq("id", legacy.id).select("id, project_intake_id, client_id, name, domain, production_url, status, created_at, launched_at").single();
    return NextResponse.json({ ok: true, site: linked ?? legacy });
  }
  const base = String(intake.company ?? "site").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "site";
  const slug = `${base}-${intake.id.replace(/-/g, "").slice(0, 8)}`;
  const { data: created, error } = await admin.from("sites").insert({ project_intake_id: intake.id, client_id: intake.client_id ?? null, name: intake.company ?? "Site FeaseWeb", slug, status: "a_preparer" }).select("id, project_intake_id, client_id, name, domain, production_url, status, created_at, launched_at").single();
  if (error || !created) {
    console.error("admin_site_create_failed", error?.code ?? "unknown", auth.user.id);
    return NextResponse.json({ error: "Impossible de créer le suivi du site." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, site: created });
}
