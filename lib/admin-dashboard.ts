import type { BackofficeData, Client, Payment, ProjectIntake, Prospect, Site } from "@/lib/backoffice";
import { needsBillingAttention } from "@/lib/subscription-state";

export const adminDashboardStages = [
  "Rendez-vous à faire",
  "Paiements à demander",
  "Paiements en attente",
  "Paiements reçus",
  "Sites à faire",
  "Sites en ligne",
  "Paiements rejetés",
  "Abonnements à surveiller",
] as const;

const subscriptionAttentionLabel: Record<string, string> = {
  retard: "Paiement en retard",
  impaye: "Abonnement impayé",
  incomplet: "Paiement incomplet",
  annule: "Abonnement résilié",
  incomplet_expire: "Abonnement jamais activé",
  en_pause: "Abonnement en pause",
};

export type AdminDashboardStage = (typeof adminDashboardStages)[number];

export type AdminDashboardItem = {
  id: string;
  stage: AdminDashboardStage;
  company: string;
  contact: string;
  href: string;
  phone?: string;
  appointmentAt?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  paymentDate?: string;
  siteUrl?: string;
  detail?: string;
  overdue?: boolean;
};

export type AdminDashboardSections = Record<AdminDashboardStage, AdminDashboardItem[]>;

const emptySections = (): AdminDashboardSections => Object.fromEntries(adminDashboardStages.map((stage) => [stage, []])) as unknown as AdminDashboardSections;

function contactName(record: { firstName: string; lastName: string }) {
  return `${record.firstName} ${record.lastName}`.trim();
}

function appointmentTimestamp(date?: string, time?: string) {
  if (!date) return null;
  const timestamp = new Date(`${date}T${time || "00:00"}:00`);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp;
}

function appointmentItem(prospect: Prospect, stage: "Rendez-vous à faire" | "Paiements à demander", now: Date): AdminDashboardItem {
  const review = prospect.review;
  const timestamp = appointmentTimestamp(review?.appointmentDate, review?.appointmentTime);
  return {
    id: `${stage}-${prospect.id}`,
    stage,
    company: prospect.company,
    contact: contactName(prospect),
    phone: prospect.phone || review?.phone,
    href: `/admin/prospects/${prospect.id}`,
    appointmentAt: timestamp?.toISOString(),
    appointmentDate: review?.appointmentDate,
    appointmentTime: review?.appointmentTime,
    overdue: stage === "Rendez-vous à faire" && Boolean(timestamp && timestamp < now),
  };
}

function clientItem(client: Client, stage: AdminDashboardStage, detail?: string, extra: Partial<AdminDashboardItem> = {}): AdminDashboardItem {
  return { id: `${stage}-${client.id}`, stage, company: client.company, contact: contactName(client), href: `/admin/clients/${client.id}`, detail, ...extra };
}

function latestStripePayment(payments: Payment[], clientId: string) {
  return payments
    .filter((payment) => payment.clientId === clientId && payment.provider === "stripe")
    .sort((a, b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? ""))[0];
}

function hasConfirmedFirstPayment(payments: Payment[], clientId: string) {
  return payments.some((payment) => payment.clientId === clientId && payment.provider === "stripe" && payment.status === "paye");
}

function paymentDate(payments: Payment[], clientId: string) {
  return payments
    .filter((payment) => payment.clientId === clientId && payment.provider === "stripe" && payment.status === "paye")
    .sort((a, b) => (a.paidAt ?? "").localeCompare(b.paidAt ?? ""))[0]?.paidAt;
}

function siteForClient(sites: Site[], clientId: string) {
  return sites.find((site) => site.clientId === clientId);
}

function isSiteDone(project?: ProjectIntake, site?: Site) {
  return project?.status === "live" || site?.status === "mise_en_ligne" || site?.status === "actif";
}

function isSiteToBuild(project?: ProjectIntake, site?: Site) {
  if (isSiteDone(project, site)) return false;
  return ["preparation", "building", "preview_ready", "client_feedback", "finalizing"].includes(project?.status ?? "") || ["a_preparer", "en_creation", "preview", "corrections", "valide", "mise_en_ligne"].includes(site?.status ?? "");
}

export function getAdminDashboardSections(data: BackofficeData, now = new Date()): AdminDashboardSections {
  const sections = emptySections();
  const projectIntakes = data.projectIntakes ?? [];
  const clients = data.clients ?? [];
  const payments = data.payments ?? [];
  const sites = data.sites ?? [];
  const projectsByClient = new Map(projectIntakes.filter((project) => project.clientId).map((project) => [project.clientId as string, project]));
  const clientsByProspect = new Map(clients.filter((client) => client.prospectId).map((client) => [client.prospectId as string, client]));

  for (const prospect of data.prospects) {
    const appointment = prospect.review?.appointmentStatus;
    const client = clientsByProspect.get(prospect.id);
    if (appointment === "scheduled") sections["Rendez-vous à faire"].push(appointmentItem(prospect, "Rendez-vous à faire", now));
    if (appointment === "completed" && prospect.review?.validationStatus !== "approved" && !client) sections["Paiements à demander"].push({ ...appointmentItem(prospect, "Rendez-vous à faire", now), stage: "Paiements à demander", detail: "Rendez-vous effectué · paiement à demander" });
    if (prospect.review?.validationStatus === "approved" && (!client || !hasConfirmedFirstPayment(payments, client.id))) {
      sections["Paiements en attente"].push({ id: `payment-${prospect.id}`, stage: "Paiements en attente", company: prospect.company, contact: contactName(prospect), phone: prospect.phone, href: client ? `/admin/clients/${client.id}` : `/admin/prospects/${prospect.id}`, detail: "49 €/mois · paiement attendu" });
    }
  }

  for (const client of clients) {
    const latestPayment = latestStripePayment(payments, client.id);
    const project = projectsByClient.get(client.id);
    const site = siteForClient(sites, client.id);
    const failedPayment = latestPayment?.status === "echoue";
    if (failedPayment) {
      sections["Paiements rejetés"].push(clientItem(client, "Paiements rejetés", "Paiement rejeté", { paymentDate: latestPayment.paidAt }));
      continue;
    }
    const subscription = (data.subscriptions ?? []).find((item) => item.clientId === client.id);
    if (subscription && needsBillingAttention(subscription.status)) {
      sections["Abonnements à surveiller"].push(clientItem(client, "Abonnements à surveiller", subscriptionAttentionLabel[subscription.status] ?? "À vérifier"));
      continue;
    }
    if (subscription?.cancelAtPeriodEnd) {
      sections["Abonnements à surveiller"].push(clientItem(client, "Abonnements à surveiller", "Résiliation programmée"));
    }
    if (!hasConfirmedFirstPayment(payments, client.id)) continue;
    if (isSiteDone(project, site)) {
      sections["Sites en ligne"].push(clientItem(client, "Sites en ligne", site?.finalDomain || site?.previewUrl || undefined, { siteUrl: site?.finalDomain || site?.previewUrl || undefined }));
    } else if (isSiteToBuild(project, site)) {
      sections["Sites à faire"].push(clientItem(client, "Sites à faire", project ? `Dossier ${project.currentStep >= 8 || project.completedAt ? "complet" : "à compléter"}` : undefined));
    } else {
      sections["Paiements reçus"].push(clientItem(client, "Paiements reçus", "Premier paiement reçu", { paymentDate: paymentDate(payments, client.id) }));
    }
  }

  sections["Rendez-vous à faire"].sort((a, b) => (a.appointmentAt ?? "").localeCompare(b.appointmentAt ?? ""));
  sections["Paiements à demander"].sort((a, b) => (b.appointmentAt ?? "").localeCompare(a.appointmentAt ?? ""));
  return sections;
}

export function formatAdminAppointment(item: AdminDashboardItem) {
  if (!item.appointmentDate) return "Date non renseignée";
  const timestamp = appointmentTimestamp(item.appointmentDate, item.appointmentTime);
  if (!timestamp) return `${item.appointmentDate}${item.appointmentTime ? ` à ${item.appointmentTime}` : ""}`;
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(timestamp) + (item.appointmentTime ? ` à ${item.appointmentTime}` : "");
}

export function formatAdminPaymentDate(value?: string) {
  if (!value) return "Date non renseignée";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}
