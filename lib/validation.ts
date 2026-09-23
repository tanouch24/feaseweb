import { z } from "zod";

const optionalText = (max: number) => z.preprocess((value) => value === "" ? undefined : value, z.string().trim().max(max).optional());

export const prospectInputSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis.").max(100),
  lastName: z.string().trim().min(1, "Le nom est requis.").max(100),
  company: z.string().trim().min(1, "L'entreprise est requise.").max(180),
  email: z.string().trim().toLowerCase().email("L'email n'est pas valide.").max(320),
  phone: optionalText(40).refine((value) => !value || /^[+()\d\s.-]{7,40}$/.test(value), "Le téléphone n'est pas valide."),
  activity: optionalText(180),
  city: optionalText(120),
  existingSiteUrl: z.preprocess((value) => value === "" ? undefined : value, z.string().trim().url("L'URL n'est pas valide.").max(2048).optional()),
  hasExistingSite: z.coerce.boolean().default(false),
  objective: optionalText(1000),
  message: optionalText(5000),
  privacyConsent: z.coerce.boolean().refine((value) => value === true, "L'acceptation de la politique de confidentialité est requise."),
  privacyPolicyVersion: z.string().trim().max(30).default("v1"),
  website: z.string().max(0).optional(),
  source: z.string().trim().max(100).default("site FeaseWeb"),
});

export type ProspectInput = z.infer<typeof prospectInputSchema>;
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(8).max(200) });
export const noteSchema = z.object({ body: z.string().trim().min(1).max(5000) });
export const sitePatchSchema = z.object({ previewUrl: z.string().trim().url().optional(), productionUrl: z.string().trim().url().optional(), domain: z.string().trim().max(253).optional(), repository: z.string().trim().max(500).optional(), hostingProvider: z.string().trim().max(120).optional(), status: z.enum(["a_preparer", "en_creation", "preview", "corrections", "valide", "mise_en_ligne", "actif", "suspendu", "archive"]).optional() }).strict();
export const statusSchema = z.object({ status: z.string().min(1).max(40) });
export const prospectStatusSchema = z.object({ status: z.enum(["nouveau", "a_contacter", "contacte", "qualifie", "preview_en_cours", "preview_envoyee", "gagne", "perdu"]) });
export const requestStatusSchema = z.object({ status: z.enum(["recue", "en_cours", "besoin_information", "terminee", "hors_perimetre"]) });
const clientUpdateFields = {
  clientId: z.string().uuid(),
  siteId: z.string().uuid().nullable().optional(),
  category: z.enum(["seo", "contenu", "maintenance", "site", "securite", "autre"]),
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1).max(5000),
  status: z.enum(["prevu", "en_cours", "termine"]),
  visibleToClient: z.boolean(),
  activityDate: z.string().date(),
};
export const clientUpdateSchema = z.object(clientUpdateFields).transform((value) => ({
  client_id: value.clientId, site_id: value.siteId ?? null, category: value.category, title: value.title,
  description: value.description, status: value.status, visible_to_client: value.visibleToClient, activity_date: value.activityDate,
}));
export const clientUpdatePatchSchema = z.object({
  siteId: z.string().uuid().nullable().optional(), category: clientUpdateFields.category.optional(), title: clientUpdateFields.title.optional(),
  description: clientUpdateFields.description.optional(), status: clientUpdateFields.status.optional(), visibleToClient: clientUpdateFields.visibleToClient.optional(),
  activityDate: clientUpdateFields.activityDate.optional(),
}).transform((value) => Object.fromEntries(Object.entries(value).map(([key, entry]) => [
  ({ siteId: "site_id", visibleToClient: "visible_to_client", activityDate: "activity_date" } as Record<string, string>)[key] ?? key, entry,
])));
export const clientRequestSchema = z.object({ title: z.string().trim().min(1).max(180), category: z.string().trim().min(1).max(120), message: z.string().trim().min(1).max(5000) });
