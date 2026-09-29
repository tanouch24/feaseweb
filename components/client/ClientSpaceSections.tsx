/* eslint-disable react/no-unescaped-entities */
import { ClientRequestForm } from "@/components/client/ClientRequestForm";
import { ClientUpdatesSection } from "@/components/client/ClientUpdatesSection";
import { StartSubscriptionButton } from "@/components/billing/BillingActions";
import { isOnboardingComplete, type OnboardingProject } from "@/lib/onboarding";
import { whatsappContactUrl } from "@/lib/whatsapp";
import { clientOrderTimeline } from "@/lib/client-order-timeline";

type ClientRecord = { first_name: string | null; last_name: string | null; company: string; email: string; phone: string | null; status: string; started_at: string | null };
type ProfileRecord = { first_name?: string | null; last_name?: string | null; email?: string | null } | null;
type SiteRecord = { id: string; name: string; domain: string | null; preview_url: string | null; production_url: string | null; status: string; created_at: string | null; launched_at: string | null } | null;
type PaymentRecord = { id: string; amount_cents: number; status: string; created_at: string; invoice_reference: string | null; period_start: string | null; period_end: string | null };
type UpdateRecord = { id: string; category?: string; update_type?: string; action_type?: string | null; title: string; description: string; status: string; activity_date: string; created_at: string; read_at?: string | null };
type RequestRecord = { id: string; title: string; category: string; message: string; status: string; created_at: string; resolved_at: string | null };

export type ClientSpaceSectionsProps = {
  client: ClientRecord;
  profile: ProfileRecord;
  project: OnboardingProject | null;
  site: SiteRecord;
  subscription: unknown;
  payments: PaymentRecord[];
  updates: UpdateRecord[];
  requests: RequestRecord[];
  seoActions: unknown[];
  appointment?: { appointment_status?: string | null; appointment_date?: string | null; appointment_time?: string | null } | null;
  validation?: { validation_status?: string | null } | null;
};

function date(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
}

function SectionHeading({ title, detail }: { title: string; detail?: string }) {
  return <div className="client-section-heading"><h2>{title}</h2>{detail && <p>{detail}</p>}</div>;
}

function ProjectTimeline({ project, appointment, paymentConfirmed, paymentDate, live }: { project: OnboardingProject | null; appointment?: ClientSpaceSectionsProps["appointment"]; paymentConfirmed: boolean; paymentDate?: string | null; live: boolean }) {
  const stages = clientOrderTimeline({ hasProject: Boolean(project && isOnboardingComplete(project)), appointmentStatus: appointment?.appointment_status, appointmentDate: appointment?.appointment_date, appointmentTime: appointment?.appointment_time, paymentConfirmed, paymentDate, live });
  return <ol className="client-project-timeline" aria-label="Suivi de votre site">{stages.map((stage, index) => <li className={`client-project-timeline-item ${stage.state}`} key={stage.key}><span className="client-project-timeline-mark" aria-hidden="true">{stage.state === "complete" ? "✓" : index + 1}</span><span><strong>{stage.label}</strong><small>{stage.detail ?? (stage.state === "complete" ? "Terminé" : stage.state === "current" ? "En cours" : "À venir")}</small></span></li>)}</ol>;
}

function RequestItem({ request }: { request: RequestRecord }) {
  const humanStatus = request.status === "terminee" ? "Terminée" : request.status === "en_cours" ? "En cours" : "Demande reçue";
  return <article className="client-request-row"><div><strong>{request.title || request.category}</strong><p>{request.message}</p><small>{date(request.created_at)}</small></div><span className={`client-chip ${request.status}`}>{humanStatus}</span></article>;
}

export function ClientSpaceSections({ project, site, payments, updates, requests, appointment, validation }: ClientSpaceSectionsProps) {
  const firstPayment = payments.filter((payment) => payment.status === "paye").sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
  const paymentConfirmed = Boolean(firstPayment);
  const live = project?.projectStatus === "live" || site?.status === "actif";
  const approved = validation?.validation_status === "approved";
  const openRequests = requests.filter((request) => !["terminee", "hors_perimetre"].includes(request.status));

  return <section id="tableau-de-bord" className="client-space-section client-dashboard-section client-simple-dashboard">
    <section className="client-card client-project-status-card"><p className="client-eyebrow">VOTRE PARCOURS</p><ProjectTimeline project={project} appointment={appointment} paymentConfirmed={paymentConfirmed} paymentDate={firstPayment?.created_at} live={live} /></section>
    {!paymentConfirmed && approved && <section className="client-card client-payment-request" aria-labelledby="client-payment-title"><p className="client-eyebrow">VOTRE PROJET EST PRÊT</p><h2 id="client-payment-title">Votre projet est prêt à démarrer.</h2><p className="client-price">49 €<span>/mois</span></p><StartSubscriptionButton label="Payer mon abonnement" /><p className="client-footnote">Création ou refonte du site, hébergement, maintenance et suivi.</p></section>}
    {!paymentConfirmed && !approved && <p className="client-muted-note client-payment-pending">Nous vous indiquerons ici lorsque votre abonnement pourra être activé.</p>}
    {live && site?.production_url && <section className="client-card client-live-card"><p className="client-eyebrow">SITE EN LIGNE</p><h2>Votre site est en ligne</h2><a className="client-button" href={site.production_url} target="_blank" rel="noreferrer">Voir mon site ↗</a></section>}
    <ClientUpdatesSection updates={updates.map((update) => ({ id: update.id, updateType: update.update_type as never, actionType: update.action_type as never, title: update.title, description: update.description, status: update.status, activityDate: update.activity_date, createdAt: update.created_at, readAt: update.read_at }))} />
    <section className="client-card client-dashboard-requests"><SectionHeading title="Besoin d'une modification ?" detail="Envoyez votre demande directement depuis votre espace." />{openRequests.length > 0 && <div className="client-request-list">{openRequests.map((request) => <RequestItem key={request.id} request={request} />)}</div>}<ClientRequestForm /></section>
    <section className="client-card client-whatsapp-card" aria-labelledby="client-whatsapp-title"><p className="client-eyebrow">BESOIN D'AIDE ?</p><h2 id="client-whatsapp-title">Une question concernant votre site ?</h2><a className="client-button" href={whatsappContactUrl} target="_blank" rel="noopener noreferrer">Nous contacter sur WhatsApp ↗</a></section>
  </section>;
}
