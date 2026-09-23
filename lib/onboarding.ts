import { z } from "zod";

export const onboardingProjectSelect = "first_name, last_name, company, email, phone, activity, has_existing_site, existing_site_url, existing_site_project, primary_objective, requested_pages, style_direction, color_mood, available_assets, contact_channel, contact_slot, current_step, project_status, completed_at";

export type OnboardingProject = {
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  activity: string | null;
  hasExistingSite: boolean;
  existingSiteUrl: string | null;
  existingSiteProject: string | null;
  primaryObjective: string | null;
  requestedPages: string[];
  styleDirection: string | null;
  colorMood: string | null;
  availableAssets: string[];
  contactChannel: string | null;
  contactSlot: string | null;
  currentStep: number;
  projectStatus: string;
  completedAt: string | null;
};

const text = (value: unknown) => typeof value === "string" ? value : null;
const list = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

/** Maps a database row to the deliberately small public onboarding DTO. */
export function mapProjectIntake(row: Record<string, unknown>): OnboardingProject {
  return {
    firstName: text(row.first_name), lastName: text(row.last_name), company: text(row.company), email: text(row.email), phone: text(row.phone),
    activity: text(row.activity), hasExistingSite: row.has_existing_site === true, existingSiteUrl: text(row.existing_site_url), existingSiteProject: text(row.existing_site_project),
    primaryObjective: text(row.primary_objective), requestedPages: list(row.requested_pages), styleDirection: text(row.style_direction), colorMood: text(row.color_mood), availableAssets: list(row.available_assets),
    contactChannel: text(row.contact_channel), contactSlot: text(row.contact_slot), currentStep: typeof row.current_step === "number" ? row.current_step : 1,
    projectStatus: text(row.project_status) ?? "prospect", completedAt: text(row.completed_at),
  };
}

export type OnboardingPatch = {
  firstName?: string; lastName?: string; company?: string; email?: string; phone?: string | null; activity?: string | null;
  hasExistingSite?: boolean; existingSiteUrl?: string | null; existingSiteProject?: string | null; primaryObjective?: string | null;
  requestedPages?: string[]; styleDirection?: string | null; colorMood?: string | null; availableAssets?: string[]; contactChannel?: string | null; contactSlot?: string | null; currentStep?: number;
};

/** Only sends fields accepted by onboardingPatchSchema; never spreads a DB row. */
export function toOnboardingPatch(project: OnboardingProject, currentStep: number): OnboardingPatch {
  return {
    firstName: project.firstName ?? undefined, lastName: project.lastName ?? undefined, company: project.company ?? undefined, email: project.email ?? undefined, phone: project.phone,
    activity: project.activity, hasExistingSite: project.hasExistingSite, existingSiteUrl: project.existingSiteUrl, existingSiteProject: project.existingSiteProject,
    primaryObjective: project.primaryObjective, requestedPages: project.requestedPages, styleDirection: project.styleDirection, colorMood: project.colorMood, availableAssets: project.availableAssets,
    contactChannel: project.contactChannel, contactSlot: project.contactSlot, currentStep,
  };
}

export function completedOnboardingSteps(project: Pick<OnboardingProject, "activity" | "hasExistingSite" | "existingSiteUrl" | "existingSiteProject" | "primaryObjective" | "requestedPages" | "styleDirection" | "colorMood" | "availableAssets" | "contactChannel" | "contactSlot">): number {
  return [
    Boolean(project.activity),
    project.hasExistingSite ? Boolean(project.existingSiteUrl && project.existingSiteProject) : true,
    Boolean(project.primaryObjective),
    project.requestedPages.length > 0,
    Boolean(project.styleDirection),
    Boolean(project.colorMood),
    project.availableAssets.length > 0,
    Boolean(project.contactChannel && project.contactSlot),
  ].filter(Boolean).length;
}

export function isOnboardingComplete(project: Pick<OnboardingProject, "activity" | "hasExistingSite" | "existingSiteUrl" | "existingSiteProject" | "primaryObjective" | "requestedPages" | "styleDirection" | "colorMood" | "availableAssets" | "contactChannel" | "contactSlot">): boolean {
  return completedOnboardingSteps(project) === 8;
}

export const onboardingDtoSchema = z.object({
  firstName: z.string().nullable(), lastName: z.string().nullable(), company: z.string().nullable(), email: z.string().nullable(), phone: z.string().nullable(),
  activity: z.string().nullable(), hasExistingSite: z.boolean(), existingSiteUrl: z.string().nullable(), existingSiteProject: z.string().nullable(), primaryObjective: z.string().nullable(),
  requestedPages: z.array(z.string()), styleDirection: z.string().nullable(), colorMood: z.string().nullable(), availableAssets: z.array(z.string()), contactChannel: z.string().nullable(), contactSlot: z.string().nullable(),
  currentStep: z.number(), projectStatus: z.string(), completedAt: z.string().nullable(),
});
