import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { calculateProductionCompleteness, type ProductionDossier } from "@/lib/production";
import type { OnboardingProject } from "@/lib/onboarding";

const project: OnboardingProject = { firstName: "Ada", lastName: "Lovelace", company: "Analytical Engines", email: "ada@example.com", phone: "0102030405", activity: "services_entreprises", hasExistingSite: false, existingSiteUrl: null, existingSiteProject: null, primaryObjective: "presentation", requestedPages: ["accueil", "contact"], styleDirection: "sobre_professionnel", colorMood: "clair_minimal", availableAssets: ["aucun"], contactChannel: "email", contactSlot: "matin", currentStep: 8, projectStatus: "subscription_active", completedAt: "2026-09-24T10:00:00.000Z" };
const dossier = (overrides: Partial<ProductionDossier> = {}): ProductionDossier => ({ id: "dossier", project_intake_id: "intake", client_id: "client", current_step: 7, completed_at: null, confirmed_at: null, public_name: "Analytical Engines", business_description: "Conseil technique pour entreprises.", public_address: null, address_public: true, public_city: "Paris", service_areas: ["Paris"], public_phone: "0102030405", public_email: "ada@example.com", opening_hours: { mode: "sur_rendez_vous" }, social_urls: [], services: [{ title: "Conseil", description: "Accompagnement" }], requested_pages: ["accueil", "contact"], priority_services: ["Conseil"], differentiators: ["Spécialisation"], primary_cta: "message", requested_features: ["contact"], content_preferences: { presentationSource: "feaseweb" }, seo_primary_activity: "Conseil technique", seo_priority_services: ["Conseil"], seo_primary_city: "Paris", seo_secondary_areas: [], seo_audience: null, seo_reference_urls: [], legal_name: "Analytical Engines", legal_form: "SASU", siren_siret: "123456789", legal_address: "Paris", technical_domain: null, technical_registrar: null, technical_host: null, technical_cms: null, technical_access: {}, rights_confirmed: false, client_confirmation: false, ...overrides });

describe("production dossier", () => {
  it("uses not_applicable for a new site's technical section", () => {
    const result = calculateProductionCompleteness(dossier(), project, [], []);
    expect(result.items.find((item) => item.key === "technical")?.state).toBe("not_applicable");
    expect(result.readyForBuild).toBe(true);
    expect(result.readyForLaunch).toBe(true);
    expect(result.score).toBe(90);
  });

  it("requires rights confirmation before launch only when client media exists", () => {
    const media = [{ id: "media", original_name: "logo.png", media_type: "logo", mime_type: "image/png", size_bytes: 100, status: "recu", created_at: "2026-09-24T10:00:00.000Z" }];
    const withoutRights = calculateProductionCompleteness(dossier(), project, [], media);
    expect(withoutRights.readyForBuild).toBe(true);
    expect(withoutRights.readyForLaunch).toBe(false);
    expect(withoutRights.blockersForLaunch).toContain("Droits d'utilisation des médias client");
    const withoutMedia = calculateProductionCompleteness(dossier(), project, [], []);
    expect(withoutMedia.readyForLaunch).toBe(true);
  });

  it("keeps refonte access blocking until every access need has a client choice", () => {
    const refonteProject = { ...project, hasExistingSite: true, existingSiteUrl: "https://example.com" };
    const partial = calculateProductionCompleteness(dossier(), refonteProject, [{ category: "domaine", status: "a_fournir", client_choice: "partiel", client_note: null }], []);
    expect(partial.readyForBuild).toBe(false);
    expect(partial.blockersForBuild).toContain("Technique / refonte");
  });

  it("exposes the seven-step client flow and private upload constraints", () => {
    const form = readFileSync(resolve(process.cwd(), "components/client/ProductionDossierForm.tsx"), "utf8");
    const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260924100000_production_dossier.sql"), "utf8");
    const mediaRoute = readFileSync(resolve(process.cwd(), "app/api/client/production/media/route.ts"), "utf8");
    expect(form).toContain("ÉTAPE {step} SUR 7");
    expect(form).toContain("stepTitles");
    expect(migration).toContain("production_dossiers");
    expect(migration).toContain("public = false");
    expect(migration).toContain("project_media");
    expect(mediaRoute).toContain("createSignedUrl");
    expect(mediaRoute).toContain("MAX_PRODUCTION_MEDIA_BYTES");
    expect(mediaRoute).toContain("PRODUCTION_MIME_TYPES");
    expect(mediaRoute).not.toContain("password");
  });

  it("does not expose direct client writes for dossier, metadata or Storage", () => {
    const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260924100000_production_dossier.sql"), "utf8");
    const dossierRoute = readFileSync(resolve(process.cwd(), "app/api/client/production/route.ts"), "utf8");
    const mediaRoute = readFileSync(resolve(process.cwd(), "app/api/client/production/media/route.ts"), "utf8");
    expect(migration).toContain("revoke all on public.production_dossiers from authenticated");
    expect(migration).toContain("revoke all on public.project_media from authenticated");
    expect(migration).toContain("grant select on public.project_media to authenticated");
    expect(migration).toContain("create policy project_media_client_select");
    expect(migration).toContain("profile.role = 'client'");
    expect(migration).toContain("production_dossiers_project_client_fk");
    expect(migration).toContain("project_media_project_client_fk");
    expect(migration).toContain("project_media_storage_path_format_check");
    expect(migration).not.toContain("create policy project_media_client_insert");
    expect(migration).not.toContain("create policy production_media_storage_insert");
    expect(migration).toContain("production_media_storage_admin_insert");
    expect(dossierRoute).toContain("createAdminClient");
    expect(mediaRoute).toContain('status: "recu"');
  });

  it("keeps the webhook and Stripe routes outside the production feature", () => {
    const dossierRoute = readFileSync(resolve(process.cwd(), "app/api/client/production/route.ts"), "utf8");
    expect(dossierRoute).not.toContain("stripe");
    expect(dossierRoute).not.toContain("project_status:");
    expect(readFileSync(resolve(process.cwd(), "app/api/stripe/webhook/route.ts"), "utf8")).toContain("ensureClientForProject");
  });
});
