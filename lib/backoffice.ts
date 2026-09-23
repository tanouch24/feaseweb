export type ProspectStatus =
  | "nouveau"
  | "a_contacter"
  | "contacte"
  | "qualifie"
  | "preview_en_cours"
  | "preview_envoyee"
  | "gagne"
  | "perdu";
export type ClientStatus = "actif" | "en_attente" | "suspendu" | "resilie";
export type ClientAccessStatus = "non_invite" | "invitation_envoyee" | "actif";
export type SiteStatus =
  | "a_preparer"
  | "en_creation"
  | "preview"
  | "corrections"
  | "valide"
  | "mise_en_ligne"
  | "actif"
  | "suspendu"
  | "archive";
export type RequestStatus =
  | "recue"
  | "en_cours"
  | "besoin_information"
  | "terminee"
  | "hors_perimetre";
export type SubscriptionStatus =
  | "incomplet"
  | "actif"
  | "retard"
  | "impaye"
  | "annule"
  | "essai"
  | "incomplet_expire"
  | "en_pause";
export type PaymentStatus = "paye" | "en_attente" | "echoue" | "rembourse";
export type ClientUpdateCategory = "seo" | "contenu" | "maintenance" | "site" | "securite" | "autre";
export type ClientUpdateStatus = "prevu" | "en_cours" | "termine";

export type Prospect = {
  id: string; createdAt: string; firstName: string; lastName: string; company: string;
  email: string; phone: string; activity: string; city: string; currentSite: string;
  hasSite: boolean; objective: string; message: string; source: string;
  status: ProspectStatus; notes: string[];
};
export type Client = {
  id: string; prospectId?: string; firstName: string; lastName: string; company: string;
  email: string; phone: string; startedAt: string; status: ClientStatus; offer: string;
  accessStatus: ClientAccessStatus; invitedAt?: string; activatedAt?: string;
  siteId?: string; subscriptionId?: string; domainId?: string; notes: string[];
};
export type Site = {
  id: string; clientId?: string; name: string; slug: string; previewUrl: string;
  finalDomain: string; repository: string; host: string; createdAt: string;
  publishedAt?: string; status: SiteStatus; technicalNotes: string;
};
export type Subscription = {
  id: string; clientId: string; status: SubscriptionStatus; amountCents: number;
  startedAt?: string; nextDueAt?: string; provider: "stripe" | "none";
  externalCustomerId?: string; externalSubscriptionId?: string; externalPriceId?: string;
  cancelAtPeriodEnd?: boolean; canceledAt?: string; lastPaymentStatus: PaymentStatus | "aucun";
};
export type Payment = {
  id: string; clientId: string; subscriptionId?: string; amountCents: number; paidAt?: string;
  status: PaymentStatus; invoice: string; period: string; provider: "stripe" | "none"; externalReference?: string;
};
export type ModificationRequest = {
  id: string; clientId: string; siteId: string; createdAt: string; category: string;
  title: string; message: string; attachments: string[]; priority: "basse" | "normale" | "haute";
  status: RequestStatus; internalReply: string; resolvedAt?: string;
};
export type SeoAction = { id: string; siteId: string; date: string; action: string; description: string; status: "a_faire" | "en_cours" | "terminee" };
export type SeoMetric = { id: string; siteId: string; clicks: number; impressions: number; ctr: number; averagePosition: number; syncedAt?: string };
export type Domain = { id: string; clientId: string; name: string; registrar: string; owner: string; expiresAt?: string; renewal: "manuel" | "automatique"; dnsStatus: "a_configurer" | "configure" | "probleme"; ssl: "actif" | "a_verifier" | "inactif"; notes: string };
export type ActivityLog = { id: string; occurredAt: string; actor: "admin" | "system"; entityType: string; entityId: string; message: string };
export type ClientUpdate = { id: string; clientId: string; siteId?: string; category: ClientUpdateCategory; title: string; description: string; status: ClientUpdateStatus; visibleToClient: boolean; activityDate: string; createdAt: string; updatedAt: string };
export type ProjectIntake = { id: string; userId: string; prospectId?: string; clientId?: string; firstName: string; lastName: string; company: string; email: string; phone: string; activity: string; hasExistingSite: boolean; existingSiteUrl: string; existingSiteProject: string; objective: string; pages: string[]; style: string; palette: string; assets: string[]; contactChannel: string; contactSlot: string; status: string; currentStep: number };

export type BackofficeData = {
  prospects: Prospect[]; clients: Client[]; sites: Site[]; subscriptions: Subscription[];
  payments: Payment[]; requests: ModificationRequest[]; clientUpdates: ClientUpdate[]; projectIntakes: ProjectIntake[]; seoActions: SeoAction[];
  seoMetrics: SeoMetric[]; domains: Domain[]; activity: ActivityLog[];
};

export const emptyData: BackofficeData = { prospects: [], clients: [], sites: [], subscriptions: [], payments: [], requests: [], clientUpdates: [], projectIntakes: [], seoActions: [], seoMetrics: [], domains: [], activity: [] };

export const labelMap: Record<string, string> = {
  nouveau: "Nouveau", a_contacter: "À contacter", contacte: "Contacté", qualifie: "Qualifié",
  preview_en_cours: "Preview à préparer", preview_envoyee: "Preview envoyée", gagne: "Gagné", perdu: "Perdu",
  actif: "Actif", en_attente: "En attente", suspendu: "Suspendu", resilie: "Résilié", non_invite: "Non invité", invitation_envoyee: "Invitation envoyée", a_preparer: "À préparer",
  en_creation: "En création", preview: "Preview prête", corrections: "Corrections", valide: "Validé",
  mise_en_ligne: "Mise en ligne", archive: "Archivé", recue: "Reçue", en_cours: "En cours",
  besoin_information: "Besoin d'information", terminee: "Terminée", hors_perimetre: "Hors périmètre",
  incomplet: "Incomplet", retard: "En retard", impaye: "Impayé", annule: "Annulé", paye: "Payé",
  echoue: "Échoué", rembourse: "Remboursé", a_faire: "À faire",
  essai: "Période d'essai", incomplet_expire: "Expiré", en_pause: "En pause", aucun: "Aucun paiement",
  prevu: "Prévu", termine: "Terminé", seo: "SEO", contenu: "Contenu", maintenance: "Maintenance", site: "Site", securite: "Sécurité", autre: "Autre",
};

export function formatDate(value?: string) { return value ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value)) : "—"; }
export function formatMoney(cents: number) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100); }
export function calculateMrr(data: BackofficeData) { return data.subscriptions.filter((subscription) => subscription.status === "actif").reduce((sum, subscription) => sum + subscription.amountCents, 0); }
export function getClientName(client?: Client) { return client ? `${client.firstName} ${client.lastName}`.trim() : "Client introuvable"; }

export function demoData(): BackofficeData {
  const now = new Date().toISOString();
  return {
    prospects: [
      { id: "prospect-demo-1", createdAt: now, firstName: "Camille", lastName: "Martin", company: "Atelier Martin", email: "camille@atelier-martin.test", phone: "06 00 00 00 01", activity: "Menuiserie", city: "Nantes", currentSite: "", hasSite: false, objective: "Présenter l'atelier et recevoir des demandes de devis.", message: "Besoin d'un site clair pour les particuliers.", source: "Formulaire FeaseWeb", status: "nouveau", notes: ["DONNÉE DE DÉMONSTRATION — ne pas contacter."] },
      { id: "prospect-demo-2", createdAt: now, firstName: "Nora", lastName: "Bernard", company: "Studio Nora", email: "nora@studio-nora.test", phone: "06 00 00 00 02", activity: "Photographie", city: "Lyon", currentSite: "https://example.test", hasSite: true, objective: "Refondre un site trop ancien.", message: "Souhaite une preview avant décision.", source: "Recommandation", status: "preview_en_cours", notes: ["DONNÉE DE DÉMONSTRATION — ne pas contacter."] },
    ],
    clients: [{ id: "client-demo-1", firstName: "Léa", lastName: "Dupont", company: "Dupont Plomberie", email: "lea@dupont-plomberie.test", phone: "06 00 00 00 03", startedAt: now, status: "actif", offer: "FeaseWeb — 49 €/mois", accessStatus: "non_invite", siteId: "site-demo-1", subscriptionId: "subscription-demo-1", domainId: "domain-demo-1", notes: ["DONNÉE DE DÉMONSTRATION — ne pas contacter."] }],
    sites: [{ id: "site-demo-1", clientId: "client-demo-1", name: "Dupont Plomberie", slug: "dupont-plomberie", previewUrl: "https://preview.example.test/dupont-plomberie", finalDomain: "dupont-plomberie.example.test", repository: "", host: "À définir", createdAt: now, status: "actif", technicalNotes: "Site de démonstration." }],
    subscriptions: [{ id: "subscription-demo-1", clientId: "client-demo-1", status: "actif", amountCents: 4900, startedAt: now, nextDueAt: now, provider: "none", lastPaymentStatus: "paye" }],
    payments: [{ id: "payment-demo-1", clientId: "client-demo-1", amountCents: 4900, paidAt: now, status: "paye", invoice: "DÉMO-0001", period: "Mois de démonstration", provider: "none" }],
    requests: [{ id: "request-demo-1", clientId: "client-demo-1", siteId: "site-demo-1", createdAt: now, title: "Mettre à jour les horaires", category: "Contenu", message: "Ajouter les horaires du samedi.", attachments: [], priority: "normale", status: "en_cours", internalReply: "À traiter dans la prochaine passe." }], clientUpdates: [], projectIntakes: [],
    seoActions: [{ id: "seo-demo-1", siteId: "site-demo-1", date: now, action: "Title modifié", description: "Donnée de démonstration.", status: "terminee" }], seoMetrics: [], domains: [{ id: "domain-demo-1", clientId: "client-demo-1", name: "dupont-plomberie.example.test", registrar: "À définir", owner: "Léa Dupont", renewal: "manuel", dnsStatus: "a_configurer", ssl: "a_verifier", notes: "Donnée de démonstration." }], activity: [{ id: "activity-demo-1", occurredAt: now, actor: "admin", entityType: "client", entityId: "client-demo-1", message: "Client de démonstration créé." }],
  };
}
