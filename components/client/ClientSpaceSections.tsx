import { ClientRequestForm } from "@/components/client/ClientRequestForm";
import { ClientUpdatesSection } from "@/components/client/ClientUpdatesSection";
import { ClientAppointmentCard } from "@/components/client/ClientAppointmentCard";
import { StartSubscriptionButton } from "@/components/billing/BillingActions";
import { isOnboardingComplete, type OnboardingProject } from "@/lib/onboarding";
import { addCalendarDays, clientOrderTimeline, formatClientDate } from "@/lib/client-order-timeline";
import { whatsappContactUrl } from "@/lib/whatsapp";
import { displayPublicSiteUrl, normalizePublicSiteUrl } from "@/lib/public-site-url";
// ClientNotifications is presented in ClientHeaderActions to keep the dashboard header compact.

type ClientRecord = { first_name: string | null; last_name: string | null; company: string; email: string; phone: string | null; status: string; started_at: string | null };
type ProfileRecord = { first_name?: string | null; last_name?: string | null; email?: string | null } | null;
type SiteRecord = { id: string; name: string; domain: string | null; preview_url: string | null; production_url: string | null; status: string; created_at: string | null; launched_at: string | null } | null;
type PaymentRecord = { id: string; amount_cents: number; status: string; created_at: string; invoice_reference: string | null; period_start: string | null; period_end: string | null };
type UpdateRecord = { id: string; category?: string; update_type?: string; action_type?: string | null; title: string; description: string; status: string; activity_date: string; created_at: string; read_at?: string | null };
type RequestRecord = { id: string; title: string; category: string; message: string; status: string; created_at: string; resolved_at: string | null };
type SeoActionRecord = { id: string; date: string; action: string; description: string; status: string };

export type ClientSpaceSectionsProps = {
  client: ClientRecord | null;
  profile: ProfileRecord;
  project: OnboardingProject | null;
  site: SiteRecord;
  subscription: unknown;
  payments: PaymentRecord[];
  updates: UpdateRecord[];
  requests: RequestRecord[];
  seoActions: SeoActionRecord[];
  appointment?: { appointment_status?: string | null; appointment_date?: string | null; appointment_time?: string | null } | null;
  validation?: { validation_status?: string | null } | null;
  projectComplete?: boolean;
};

function date(value: string) { return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value)); }
function ProjectTimeline({ project, appointment, paymentConfirmed, paymentDate, live }: { project: OnboardingProject | null; appointment?: ClientSpaceSectionsProps["appointment"]; paymentConfirmed: boolean; paymentDate?: string | null; live: boolean }) {
  const stages = clientOrderTimeline({ hasProject: Boolean(project && isOnboardingComplete(project)), appointmentStatus: appointment?.appointment_status, appointmentDate: appointment?.appointment_date, appointmentTime: appointment?.appointment_time, paymentConfirmed, paymentDate, live });
  return <ol className="client-project-timeline" aria-label="Suivi de votre site">{stages.map((stage, index) => <li className={`client-project-timeline-item ${stage.state}`} key={stage.key}><span className="client-project-timeline-mark" aria-hidden="true">{stage.state === "complete" ? "✓" : index + 1}</span><span><strong>{stage.label}</strong><small>{stage.detail ?? (stage.state === "complete" ? "Terminé" : stage.state === "current" ? "En cours" : "À venir")}</small></span></li>)}</ol>;
}
function RequestItem({ request }: { request: RequestRecord }) { const status = request.status === "terminee" ? "Terminée" : request.status === "en_cours" ? "En cours" : "Demande reçue"; return <article className="client-request-row"><div><strong>{request.title || request.category}</strong><p>{request.message}</p><small>{date(request.created_at)}</small></div><span className={`client-chip ${request.status}`}>{status}</span></article>; }
function WorkHistory({ actions, updates }: { actions: SeoActionRecord[]; updates: UpdateRecord[] }) {
  const entries = [...actions.map((action) => ({ id: `seo:${action.id}`, date: action.date, title: action.action, description: action.description, status: action.status })), ...updates.filter((update) => ["information", "avancement"].includes(update.update_type ?? "")).map((update) => ({ id: `update:${update.id}`, date: update.activity_date, title: update.title, description: update.description, status: "terminee" }))].sort((a, b) => b.date.localeCompare(a.date));
  return <section className="client-card client-seo-follow-up" aria-labelledby="client-seo-title"><p className="client-eyebrow">TRAVAIL RÉALISÉ PAR FEASEWEB</p><h2 id="client-seo-title">Le travail réalisé par FeaseWeb</h2>{entries.length ? <div className="client-seo-list">{entries.map((entry) => <article className="client-seo-entry" key={entry.id}><div className="client-seo-entry-meta"><span>{date(entry.date)}</span><span className="client-chip">{entry.status === "terminee" ? "Terminée" : entry.status === "en_cours" ? "En cours" : "À faire"}</span></div><h3>{entry.title}</h3>{entry.description && <p>{entry.description}</p>}</article>)}</div> : <p className="client-muted-note">Les actions réalisées par FeaseWeb apparaîtront ici.</p>}</section>;
}
function ActionRequired({ projectComplete, approved, paymentConfirmed, appointment, updates }: { projectComplete: boolean; approved: boolean; paymentConfirmed: boolean; appointment?: ClientSpaceSectionsProps["appointment"]; updates: UpdateRecord[] }) {
  const items: { label: string; text: string; href: string }[] = [];
  if (!projectComplete) items.push({ label: "Votre configuration", text: "Quelques informations manquent encore.", href: "/creer-mon-site" });
  if (!appointment?.appointment_status || appointment.appointment_status === "cancelled") items.push({ label: "Votre rendez-vous", text: "Choisissez un moment pour parler de votre projet.", href: "#rendez-vous" });
  if (approved && !paymentConfirmed) items.push({ label: "Votre abonnement", text: "Votre projet est prêt à démarrer.", href: "#paiement" });
  const unreadAction = updates.find((update) => update.update_type === "action_requise" && !update.read_at);
  if (unreadAction) items.push({ label: "FeaseWeb a besoin de vous", text: unreadAction.title, href: "#notifications" });
  if (!items.length) return null;
  return <section className="client-action-required" aria-labelledby="client-action-required-title"><div className="client-action-required-heading"><p className="client-eyebrow">À FAIRE</p><h2 id="client-action-required-title">Les prochaines étapes</h2></div><div className="client-action-list">{items.map((item) => <article key={item.label}><div><strong>{item.label}</strong><p>{item.text}</p></div><a className="client-text-link" href={item.href}>Voir →</a></article>)}</div></section>;
}

export function ClientSpaceSections({ client, project, site, payments, updates, requests, seoActions, appointment, validation, projectComplete = true }: ClientSpaceSectionsProps) {
  const firstPayment = payments.filter((payment) => payment.status === "paye").sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
  const paymentConfirmed = Boolean(firstPayment);
  const siteUrl = normalizePublicSiteUrl(site?.production_url || site?.domain);
  const siteUrlLabel = displayPublicSiteUrl(site?.production_url || site?.domain);
  const live = Boolean(siteUrl && (site?.status === "actif" || project?.projectStatus === "live"));
  const approved = validation?.validation_status === "approved";
  const openRequests = requests.filter((request) => !["terminee", "hors_perimetre"].includes(request.status));
  const deliveryEstimate = paymentConfirmed && !live && firstPayment ? addCalendarDays(firstPayment.created_at) : null;
  const notificationUpdates = updates.filter((update) => !["information", "avancement"].includes(update.update_type ?? "")).map((update) => ({ id: update.id, updateType: update.update_type as never, actionType: update.action_type as never, title: update.title, description: update.description, status: update.status, activityDate: update.activity_date, createdAt: update.created_at, readAt: update.read_at }));

  return <section id="tableau-de-bord" className="client-space-section client-dashboard-section client-simple-dashboard">
    <section id="mon-site" className="client-card client-main-site-card" aria-labelledby="client-main-site-title"><p className="client-eyebrow">MON SITE INTERNET</p><h2 id="client-main-site-title">{live ? "Votre site est en ligne ✓" : siteUrl ? "Votre site est en construction" : "Votre site est en préparation"}</h2>{siteUrl ? <><p className="client-site-url">{siteUrlLabel}</p><a className="client-button" href={siteUrl} target="_blank" rel="noreferrer">Voir mon site ↗</a>{!live && <p className="client-muted-note">FeaseWeb prépare actuellement votre site.</p>}</> : <p className="client-muted-note">{deliveryEstimate ? `Livraison estimée : ${formatClientDate(deliveryEstimate)}` : "FeaseWeb prépare actuellement votre projet."}</p>}</section>
    <section className="client-card client-project-status-card"><p className="client-eyebrow">VOTRE PARCOURS</p><ProjectTimeline project={project} appointment={appointment} paymentConfirmed={paymentConfirmed} paymentDate={firstPayment?.created_at} live={live} /></section>
    <ActionRequired projectComplete={projectComplete} approved={approved} paymentConfirmed={paymentConfirmed} appointment={appointment} updates={updates} />
    <div className="client-dashboard-grid"><div id="rendez-vous">{projectComplete && <ClientAppointmentCard initialAppointment={appointment ?? null} />}</div><section id="paiement" className="client-card client-payment-status"><p className="client-eyebrow">VOTRE ABONNEMENT</p><h2>{paymentConfirmed ? "Abonnement actif ✓" : approved ? "Votre projet est prêt à démarrer." : "Abonnement"}</h2>{paymentConfirmed ? <p className="client-muted-note">49 €/mois · Paiement confirmé.</p> : approved ? <><p className="client-price">49 €<span>/mois</span></p><StartSubscriptionButton label="Payer mon abonnement" /><p className="client-footnote">Création ou refonte du site, hébergement, maintenance et suivi.</p></> : <p className="client-muted-note">Le paiement sera disponible lorsque votre dossier sera prêt.</p>}</section></div>
    <WorkHistory actions={seoActions} updates={updates} />
    <ClientUpdatesSection updates={notificationUpdates} />
     <section className="client-contact-panel" aria-labelledby="client-contact-title"><div className="client-contact-intro"><p className="client-eyebrow">BESOIN DE NOUS ?</p><h2 id="client-contact-title">Une question ou une modification concernant votre site ?</h2></div><div className="client-contact-actions"><ClientRequestForm compact supportOnly />{client && <ClientRequestForm compact label="Faire une demande de modification" />}<a className="client-contact-whatsapp" href={whatsappContactUrl} target="_blank" rel="noopener noreferrer">Besoin d&apos;une réponse rapide ? <strong>WhatsApp →</strong></a></div>{openRequests.length > 0 && <div className="client-request-list">{openRequests.map((request) => <RequestItem key={request.id} request={request} />)}</div>}</section>
  </section>;
}
