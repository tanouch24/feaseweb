import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateProductionCompleteness, mapProductionDossier, PRODUCTION_MEDIA_BUCKET, productionDossierSelect, type ProductionAccess, type ProductionMedia } from "@/lib/production";
import { mapProjectIntake } from "@/lib/onboarding";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  const { data: client } = await admin.from("clients").select("id, company, first_name, last_name, email").eq("id", id).maybeSingle();
  if (!client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
  const [{ data: intake }, { data: dossier }, { data: access }, { data: media }] = await Promise.all([
    admin.from("project_intakes").select("id, first_name, last_name, company, email, phone, activity, has_existing_site, existing_site_url, existing_site_project, primary_objective, requested_pages, style_direction, color_mood, available_assets, contact_channel, contact_slot, current_step, project_status, completed_at").eq("client_id", id).maybeSingle(),
    admin.from("production_dossiers").select(productionDossierSelect).eq("client_id", id).maybeSingle(),
    admin.from("project_access_requirements").select("category, status, client_choice, client_note").eq("project_intake_id", (await admin.from("project_intakes").select("id").eq("client_id", id).maybeSingle()).data?.id ?? ""),
    admin.from("project_media").select("id, original_name, media_type, mime_type, size_bytes, status, created_at, storage_path").eq("client_id", id).order("created_at", { ascending: false }),
  ]);
  const mapped = dossier ? mapProductionDossier(dossier) : null;
  const completeness = intake ? calculateProductionCompleteness(mapped, mapProjectIntake(intake), (access ?? []) as ProductionAccess[], (media ?? []) as ProductionMedia[]) : null;
  const signedMedia = await Promise.all((media ?? []).map(async (item) => {
    const { data: signed } = await admin.storage.from(PRODUCTION_MEDIA_BUCKET).createSignedUrl(item.storage_path, 300);
    return { id: item.id, original_name: item.original_name, media_type: item.media_type, mime_type: item.mime_type, size_bytes: item.size_bytes, status: item.status, created_at: item.created_at, signed_url: signed?.signedUrl ?? null };
  }));
  return NextResponse.json({ client, intake, dossier: mapped, access: access ?? [], media: signedMedia, completeness });
}
