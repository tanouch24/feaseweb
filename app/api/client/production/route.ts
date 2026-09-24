import { NextResponse } from "next/server";
import { requireClient } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateProductionCompleteness, mapProductionDossier, productionDossierSchema, productionDossierSelect, type ProductionAccess, type ProductionMedia } from "@/lib/production";
import { mapProjectIntake, onboardingProjectSelect } from "@/lib/onboarding";

export const dynamic = "force-dynamic";

async function getContext() {
  const current = await requireClient();
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) return { current, supabase: null, admin: null, client: null, intake: null };
  const { data: client } = await supabase.from("clients").select("id, first_name, last_name, company, email, phone").eq("user_id", current.user.id).maybeSingle();
  const { data: intake } = client ? await supabase.from("project_intakes").select(`id, ${onboardingProjectSelect}`).eq("client_id", client.id).maybeSingle() : { data: null };
  return { current, supabase, admin, client, intake };
}

export async function GET() {
  const { supabase, admin, client, intake } = await getContext();
  if (!supabase || !admin) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  if (!client || !intake) return NextResponse.json({ error: "Dossier client introuvable." }, { status: 404 });
  const [{ data: dossier }, { data: access }, { data: media }] = await Promise.all([
    admin.from("production_dossiers").select(productionDossierSelect).eq("client_id", client.id).maybeSingle(),
    admin.from("project_access_requirements").select("category, status, client_choice, client_note").eq("project_intake_id", intake.id),
    admin.from("project_media").select("id, original_name, media_type, mime_type, size_bytes, status, created_at").eq("client_id", client.id).order("created_at", { ascending: false }),
  ]);
  if (dossier === null && !intake) return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });
  const mapped = dossier ? mapProductionDossier(dossier) : null;
  const completeness = calculateProductionCompleteness(mapped, mapProjectIntake(intake), (access ?? []) as ProductionAccess[], (media ?? []) as ProductionMedia[]);
  return NextResponse.json({ dossier: mapped, access: access ?? [], media: media ?? [], completeness });
}

export async function PATCH(request: Request) {
  const { supabase, client, intake } = await getContext();
  if (!supabase) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  if (!client || !intake) return NextResponse.json({ error: "Dossier client introuvable." }, { status: 404 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }
  const parsed = productionDossierSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Certains champs sont invalides.", details: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const { data: existingIntake } = await admin.from("project_intakes").select("project_status").eq("id", intake.id).maybeSingle();
  const { data: existingDossier } = await admin.from("production_dossiers").select("requested_pages, services, requested_features, primary_cta").eq("client_id", client.id).maybeSingle();
  const productionRank: Record<string, number> = { project_configured: 0, subscription_active: 1, preparation: 2, building: 3, preview_ready: 4, client_feedback: 5, finalizing: 6, live: 7 };
  const isProductionAdvanced = productionRank[existingIntake?.project_status ?? "project_configured"] >= productionRank.building;
  const criticalChanged = existingDossier && (["requestedPages", "services", "requestedFeatures", "primaryCta"] as const).some((key) => key in input && JSON.stringify(input[key]) !== JSON.stringify(existingDossier[{ requestedPages: "requested_pages", services: "services", requestedFeatures: "requested_features", primaryCta: "primary_cta" }[key] as keyof typeof existingDossier]));
  if (isProductionAdvanced && criticalChanged) return NextResponse.json({ error: "La production a commencé. Pour modifier la structure du site, envoyez une demande à FeaseWeb." }, { status: 409 });
  const update: Record<string, unknown> = { project_intake_id: intake.id, client_id: client.id };
  const fieldMap: Record<string, string> = {
    currentStep: "current_step", publicName: "public_name", businessDescription: "business_description", publicAddress: "public_address", addressPublic: "address_public", publicCity: "public_city", serviceAreas: "service_areas", publicPhone: "public_phone", publicEmail: "public_email", openingHours: "opening_hours", socialUrls: "social_urls", services: "services", requestedPages: "requested_pages", priorityServices: "priority_services", differentiators: "differentiators", primaryCta: "primary_cta", requestedFeatures: "requested_features", contentPreferences: "content_preferences", seoPrimaryActivity: "seo_primary_activity", seoPriorityServices: "seo_priority_services", seoPrimaryCity: "seo_primary_city", seoSecondaryAreas: "seo_secondary_areas", seoAudience: "seo_audience", seoReferenceUrls: "seo_reference_urls", legalName: "legal_name", legalForm: "legal_form", sirenSiret: "siren_siret", legalAddress: "legal_address", technicalDomain: "technical_domain", technicalRegistrar: "technical_registrar", technicalHost: "technical_host", technicalCms: "technical_cms", technicalAccess: "technical_access", rightsConfirmed: "rights_confirmed", clientConfirmation: "client_confirmation",
  };
  for (const [key, column] of Object.entries(fieldMap)) if (key in input) update[column] = input[key as keyof typeof input];
  const { error: upsertError } = await admin.from("production_dossiers").upsert(update, { onConflict: "project_intake_id" });
  if (upsertError) { console.error("[production] dossier save failed", { code: upsertError.code, message: upsertError.message }); return NextResponse.json({ error: "Impossible d'enregistrer le dossier." }, { status: 500 }); }
  const { data: saved } = await admin.from("production_dossiers").select(productionDossierSelect).eq("client_id", client.id).single();
  const { data: access } = await admin.from("project_access_requirements").select("category, status, client_choice, client_note").eq("project_intake_id", intake.id);
  const { data: media } = await admin.from("project_media").select("id, original_name, media_type, mime_type, size_bytes, status, created_at").eq("client_id", client.id);
  const mapped = saved ? mapProductionDossier(saved) : null;
  const completeness = calculateProductionCompleteness(mapped, mapProjectIntake(intake), (access ?? []) as ProductionAccess[], (media ?? []) as ProductionMedia[]);
  if (input.completed && !completeness.readyForBuild) return NextResponse.json({ error: "Le dossier comporte encore des informations nécessaires.", completeness }, { status: 422 });
  if (input.completed || input.clientConfirmation) {
    const completionUpdate: Record<string, string> = {};
    if (input.completed && completeness.readyForBuild) completionUpdate.completed_at = new Date().toISOString();
    if (input.clientConfirmation) completionUpdate.confirmed_at = new Date().toISOString();
    if (Object.keys(completionUpdate).length) await admin.from("production_dossiers").update(completionUpdate).eq("client_id", client.id);
  }
  return NextResponse.json({ dossier: mapped, completeness });
}
