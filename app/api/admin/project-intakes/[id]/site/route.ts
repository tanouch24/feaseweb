import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { projectSiteSaveSchema } from "@/lib/validation";

const siteSelect = "id, project_intake_id, client_id, name, domain, production_url, status, created_at, launched_at";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuration serveur incomplète." }, { status: 503 });
  const { id: intakeId } = await params;
  const parsed = projectSiteSaveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "URL de site invalide." }, { status: 422 });
  const { data: intake } = await admin.from("project_intakes").select("id, client_id, company").eq("id", intakeId).maybeSingle();
  if (!intake) return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });

  const { data: intakeSite } = await admin.from("sites").select(siteSelect).eq("project_intake_id", intake.id).order("created_at").limit(1).maybeSingle();
  let site = intakeSite;
  if (!site && intake.client_id) {
    const { data: legacySite } = await admin.from("sites").select(siteSelect).eq("client_id", intake.client_id).order("created_at").limit(1).maybeSingle();
    if (legacySite) {
      const { data: linked, error } = await admin.from("sites").update({ project_intake_id: intake.id, domain: parsed.data.domain }).eq("id", legacySite.id).select(siteSelect).single();
      if (error || !linked) return NextResponse.json({ error: "Impossible d'enregistrer le site." }, { status: 500 });
      site = linked;
    }
  }
  if (!site) {
    const base = String(intake.company ?? "site").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "site";
    const slug = `${base}-${intake.id.replace(/-/g, "").slice(0, 8)}`;
    const { data: created, error } = await admin.from("sites").insert({ project_intake_id: intake.id, client_id: intake.client_id ?? null, name: intake.company ?? "Site FeaseWeb", slug, domain: parsed.data.domain, status: "a_preparer" }).select(siteSelect).single();
    if (error || !created) {
      console.error("admin_project_site_create_failed", error?.code ?? "unknown", auth.user.id);
      return NextResponse.json({ error: "Impossible d'enregistrer le site." }, { status: 500 });
    }
    site = created;
  } else if (site.domain !== parsed.data.domain) {
    const { data: updated, error } = await admin.from("sites").update({ domain: parsed.data.domain }).eq("id", site.id).select(siteSelect).single();
    if (error || !updated) return NextResponse.json({ error: "Impossible d'enregistrer le site." }, { status: 500 });
    site = updated;
  }
  await admin.from("activity_log").insert({ actor_id: auth.user.id, entity_type: "site", entity_id: site.id, message: "URL du site enregistrée depuis le dossier." });
  return NextResponse.json({ ok: true, site });
}
