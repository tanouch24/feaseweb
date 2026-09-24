import { z } from "zod";
import type { OnboardingProject } from "@/lib/onboarding";

export const PRODUCTION_MEDIA_BUCKET = "feaseweb-production-media";
export const MAX_PRODUCTION_MEDIA_BYTES = 10 * 1024 * 1024;
export const PRODUCTION_MEDIA_TYPES = ["logo", "photo", "realisation", "avis_document", "certification", "document_utile"] as const;
export const PRODUCTION_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"] as const;

export const productionServiceSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(600).optional().default(""),
});

export const productionOpeningHoursSchema = z.record(z.string(), z.string().max(120)).default({});
export const productionTechnicalAccessSchema = z.record(z.string(), z.enum(["connait_acces", "partiel", "ne_sait_pas", "agence", "non_necessaire"]));

export const productionDossierSchema = z.object({
  currentStep: z.number().int().min(1).max(7).optional(),
  publicName: z.string().trim().max(180).nullable().optional(),
  businessDescription: z.string().trim().max(2000).nullable().optional(),
  publicAddress: z.string().trim().max(300).nullable().optional(),
  addressPublic: z.boolean().optional(),
  publicCity: z.string().trim().max(120).nullable().optional(),
  serviceAreas: z.array(z.string().trim().min(1).max(120)).max(30).optional(),
  publicPhone: z.string().trim().max(40).nullable().optional(),
  publicEmail: z.string().email().max(320).nullable().optional(),
  openingHours: productionOpeningHoursSchema.optional(),
  socialUrls: z.array(z.string().url().max(2048)).max(12).optional(),
  services: z.array(productionServiceSchema).max(30).optional(),
  requestedPages: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  priorityServices: z.array(z.string().trim().min(1).max(160)).max(3).optional(),
  differentiators: z.array(z.string().trim().min(1).max(80)).max(12).optional(),
  primaryCta: z.enum(["devis", "appel", "rendez_vous", "message", "visite"]).nullable().optional(),
  requestedFeatures: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  contentPreferences: z.record(z.string(), z.unknown()).optional(),
  seoPrimaryActivity: z.string().trim().max(180).nullable().optional(),
  seoPriorityServices: z.array(z.string().trim().min(1).max(160)).max(3).optional(),
  seoPrimaryCity: z.string().trim().max(120).nullable().optional(),
  seoSecondaryAreas: z.array(z.string().trim().min(1).max(120)).max(30).optional(),
  seoAudience: z.string().trim().max(1000).nullable().optional(),
  seoReferenceUrls: z.array(z.string().url().max(2048)).max(8).optional(),
  legalName: z.string().trim().max(180).nullable().optional(),
  legalForm: z.string().trim().max(120).nullable().optional(),
  sirenSiret: z.string().trim().max(30).nullable().optional(),
  legalAddress: z.string().trim().max(300).nullable().optional(),
  technicalDomain: z.string().trim().max(255).nullable().optional(),
  technicalRegistrar: z.string().trim().max(180).nullable().optional(),
  technicalHost: z.string().trim().max(180).nullable().optional(),
  technicalCms: z.string().trim().max(120).nullable().optional(),
  technicalAccess: productionTechnicalAccessSchema.optional(),
  rightsConfirmed: z.boolean().optional(),
  clientConfirmation: z.boolean().optional(),
  completed: z.boolean().optional(),
});

export type ProductionDossierInput = z.infer<typeof productionDossierSchema>;

export type ProductionDossier = {
  id: string;
  project_intake_id: string;
  client_id: string;
  current_step: number;
  completed_at: string | null;
  confirmed_at: string | null;
  public_name: string | null;
  business_description: string | null;
  public_address: string | null;
  address_public: boolean;
  public_city: string | null;
  service_areas: string[];
  public_phone: string | null;
  public_email: string | null;
  opening_hours: Record<string, string>;
  social_urls: string[];
  services: Array<{ title: string; description?: string }>;
  requested_pages: string[];
  priority_services: string[];
  differentiators: string[];
  primary_cta: string | null;
  requested_features: string[];
  content_preferences: Record<string, unknown>;
  seo_primary_activity: string | null;
  seo_priority_services: string[];
  seo_primary_city: string | null;
  seo_secondary_areas: string[];
  seo_audience: string | null;
  seo_reference_urls: string[];
  legal_name: string | null;
  legal_form: string | null;
  siren_siret: string | null;
  legal_address: string | null;
  technical_domain: string | null;
  technical_registrar: string | null;
  technical_host: string | null;
  technical_cms: string | null;
  technical_access: Record<string, string>;
  rights_confirmed: boolean;
  client_confirmation: boolean;
};

export type ProductionMedia = {
  id: string;
  original_name: string;
  media_type: string;
  mime_type: string;
  size_bytes: number;
  status: string;
  created_at: string;
  signed_url?: string | null;
};

export type ProductionAccess = { category: string; status: string; client_choice: string | null; client_note: string | null };

const hasText = (value: string | null | undefined) => Boolean(value?.trim());
const hasItems = (value: unknown[] | null | undefined) => Boolean(value?.length);

export type CompletenessItem = { key: string; label: string; weight: number; state: "complete" | "missing" | "not_applicable"; level: "blocking" | "recommended" | "optional" };
export type ProductionCompleteness = { score: number; items: CompletenessItem[]; readyForBuild: boolean; readyForLaunch: boolean; blockersForBuild: string[]; blockersForLaunch: string[] };

/** Pure, shared rules. The server supplies the real dossier, intake, access and media rows. */
export function calculateProductionCompleteness(dossier: ProductionDossier | null, intake: Pick<OnboardingProject, "activity" | "requestedPages" | "styleDirection" | "colorMood" | "hasExistingSite">, access: ProductionAccess[], media: ProductionMedia[]): ProductionCompleteness {
  const d = dossier;
  const needsLocation = ["artisan_btp", "commerce", "restaurant", "beaute", "sante", "immobilier", "automobile"].includes(intake.activity ?? "");
  const locationComplete = !needsLocation || hasText(d?.public_address) || hasItems(d?.service_areas);
  const refonteTechnical = !intake.hasExistingSite || ["domaine", "dns", "cms", "hebergement"].every((category) => access.some((item) => item.category === category && item.client_choice));
  const mediaDecision = Boolean(d?.rights_confirmed || media.length > 0 || d?.content_preferences?.mediaDecision === "aucun");
  const items: CompletenessItem[] = [
    { key: "identity", label: "Nom public et description", weight: 8, state: hasText(d?.public_name) && hasText(d?.business_description) ? "complete" : "missing", level: "blocking" },
    { key: "coordinates", label: "Coordonnées publiques", weight: 7, state: (hasText(d?.public_phone) || hasText(d?.public_email)) && locationComplete ? "complete" : "missing", level: "blocking" },
    { key: "services", label: "Prestations principales", weight: 20, state: hasItems(d?.services) && hasItems(d?.priority_services) ? "complete" : "missing", level: "blocking" },
    { key: "pages", label: "Pages et fonctionnalités", weight: 15, state: hasItems(d?.requested_pages?.length ? d.requested_pages : intake.requestedPages) && hasItems(d?.requested_features) ? "complete" : "missing", level: "blocking" },
    { key: "content", label: "Contenus et méthode de rédaction", weight: 15, state: hasText(d?.business_description) && Boolean(d?.content_preferences?.presentationSource) ? "complete" : "missing", level: "blocking" },
    { key: "design", label: "Design", weight: 10, state: hasText(intake.styleDirection) && hasText(intake.colorMood) ? "complete" : "missing", level: "blocking" },
    { key: "media", label: "Médias et droits d'utilisation", weight: 10, state: mediaDecision ? "complete" : "missing", level: "recommended" },
    { key: "seo", label: "SEO initial", weight: 7, state: hasText(d?.seo_primary_activity) && (hasText(d?.seo_primary_city) || hasItems(d?.seo_secondary_areas)) ? "complete" : "missing", level: "recommended" },
    { key: "legal", label: "Informations légales", weight: 5, state: hasText(d?.legal_name) && hasText(d?.legal_address) ? "complete" : "missing", level: "recommended" },
    { key: "technical", label: "Technique / refonte", weight: 3, state: refonteTechnical ? (intake.hasExistingSite ? "complete" : "not_applicable") : "missing", level: "blocking" },
  ];
  const score = Math.round(items.reduce((sum, item) => sum + (item.state === "complete" || item.state === "not_applicable" ? item.weight : 0), 0));
  const blockersForBuild = items.filter((item) => item.level === "blocking" && item.state === "missing").map((item) => item.label);
  const blockersForLaunch = [...blockersForBuild, ...items.filter((item) => item.key === "legal" && item.state === "missing").map((item) => item.label)];
  if (media.length > 0 && d?.rights_confirmed !== true) blockersForLaunch.push("Droits d'utilisation des médias client");
  return { score, items, readyForBuild: blockersForBuild.length === 0, readyForLaunch: blockersForLaunch.length === 0, blockersForBuild, blockersForLaunch };
}

export const productionDossierSelect = "id, project_intake_id, client_id, current_step, completed_at, confirmed_at, public_name, business_description, public_address, address_public, public_city, service_areas, public_phone, public_email, opening_hours, social_urls, services, requested_pages, priority_services, differentiators, primary_cta, requested_features, content_preferences, seo_primary_activity, seo_priority_services, seo_primary_city, seo_secondary_areas, seo_audience, seo_reference_urls, legal_name, legal_form, siren_siret, legal_address, technical_domain, technical_registrar, technical_host, technical_cms, technical_access, rights_confirmed, client_confirmation";

export function mapProductionDossier(row: Record<string, unknown>): ProductionDossier {
  const array = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  const record = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const services = Array.isArray(row.services) ? row.services.filter((item): item is { title: string; description?: string } => Boolean(item && typeof item === "object" && typeof (item as { title?: unknown }).title === "string")) : [];
  return {
    id: String(row.id), project_intake_id: String(row.project_intake_id), client_id: String(row.client_id), current_step: typeof row.current_step === "number" ? row.current_step : 1,
    completed_at: typeof row.completed_at === "string" ? row.completed_at : null, confirmed_at: typeof row.confirmed_at === "string" ? row.confirmed_at : null,
    public_name: typeof row.public_name === "string" ? row.public_name : null, business_description: typeof row.business_description === "string" ? row.business_description : null,
    public_address: typeof row.public_address === "string" ? row.public_address : null, address_public: row.address_public !== false, public_city: typeof row.public_city === "string" ? row.public_city : null,
    service_areas: array(row.service_areas), public_phone: typeof row.public_phone === "string" ? row.public_phone : null, public_email: typeof row.public_email === "string" ? row.public_email : null,
    opening_hours: record(row.opening_hours) as Record<string, string>, social_urls: array(row.social_urls), services, differentiators: array(row.differentiators),
    primary_cta: typeof row.primary_cta === "string" ? row.primary_cta : null, requested_pages: array(row.requested_pages), priority_services: array(row.priority_services), requested_features: array(row.requested_features), content_preferences: record(row.content_preferences),
    seo_primary_activity: typeof row.seo_primary_activity === "string" ? row.seo_primary_activity : null, seo_priority_services: array(row.seo_priority_services), seo_primary_city: typeof row.seo_primary_city === "string" ? row.seo_primary_city : null,
    seo_secondary_areas: array(row.seo_secondary_areas), seo_audience: typeof row.seo_audience === "string" ? row.seo_audience : null, seo_reference_urls: array(row.seo_reference_urls),
    legal_name: typeof row.legal_name === "string" ? row.legal_name : null, legal_form: typeof row.legal_form === "string" ? row.legal_form : null, siren_siret: typeof row.siren_siret === "string" ? row.siren_siret : null, legal_address: typeof row.legal_address === "string" ? row.legal_address : null,
    technical_domain: typeof row.technical_domain === "string" ? row.technical_domain : null, technical_registrar: typeof row.technical_registrar === "string" ? row.technical_registrar : null, technical_host: typeof row.technical_host === "string" ? row.technical_host : null, technical_cms: typeof row.technical_cms === "string" ? row.technical_cms : null,
    technical_access: record(row.technical_access) as Record<string, string>, rights_confirmed: row.rights_confirmed === true, client_confirmation: row.client_confirmation === true,
  };
}
