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
