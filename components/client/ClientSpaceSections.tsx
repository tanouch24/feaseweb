import { ClientRequestForm } from "@/components/client/ClientRequestForm";
import { ClientAppointmentCard } from "@/components/client/ClientAppointmentCard";
import { StartSubscriptionButton } from "@/components/billing/BillingActions";
import { isOnboardingComplete, type OnboardingProject } from "@/lib/onboarding";
import { addCalendarDays, clientOrderTimeline, formatClientDate } from "@/lib/client-order-timeline";
import { whatsappContactUrl } from "@/lib/whatsapp";
import { displayPublicSiteUrl, normalizePublicSiteUrl } from "@/lib/public-site-url";
import { ArrowUpRightIcon, CalendarIcon, CreditCardIcon, GlobeIcon, MessageIcon, ActivityIcon } from "@/components/client/ClientIcons";
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
  return <ol className="client-project-timeline" aria-label="Suivi de votre site">{stages.map((stage, index) => <li className={`client-project-timeline-item ${stage.state}`} key={stage.key}><div className="client-project-timeline-marker-row"><span className="client-project-timeline-mark" aria-hidden="true">{stage.state === "complete" ? "✓" : index + 1}</span>{index < stages.length - 1 && <span className="client-project-timeline-connector" aria-hidden="true" />}</div><span className="client-project-timeline-copy"><strong>{stage.label}</strong><small>{stage.detail ?? (stage.state === "complete" ? "Terminé" : stage.state === "current" ? "En cours" : "À venir")}</small></span></li>)}</ol>;
}
function RequestItem({ request }: { request: RequestRecord }) { const status = request.status === "terminee" ? "Terminée" : request.status === "en_cours" ? "En cours" : "Demande reçue"; return <article className="client-request-row"><div><strong>{request.title || request.category}</strong><p>{request.message}</p><small>{date(request.created_at)}</small></div><span className={`client-chip ${request.status}`}>{status}</span></article>; }
function WorkHistory({ actions, updates }: { actions: SeoActionRecord[]; updates: UpdateRecord[] }) {
  const entries = [...actions.map((action) => ({ id: `seo:${action.id}`, date: action.date, title: action.action, description: action.description, status: action.status })), ...updates.filter((update) => ["information", "avancement"].includes(update.update_type ?? "")).map((update) => ({ id: `update:${update.id}`, date: update.activity_date, title: update.title, description: update.description, status: "terminee" }))].sort((a, b) => b.date.localeCompare(a.date));
  return <section className="client-card client-seo-follow-up" aria-labelledby="client-seo-title"><ActivityIcon /><p className="client-eyebrow">ACTIVITÉ DE VOTRE SITE</p><h2 id="client-seo-title">Travail réalisé par FeaseWeb</h2>{entries.length ? <div className="client-seo-list">{entries.map((entry) => <article className="client-seo-entry" key={entry.id}><div className="client-seo-entry-meta"><span>{date(entry.date)}</span><span className="client-chip">{entry.status === "terminee" ? "Terminée" : entry.status === "en_cours" ? "En cours" : "À faire"}</span></div><h3>{entry.title}</h3>{entry.description && <p>{entry.description}</p>}</article>)}</div> : <p className="client-muted-note">Aucune intervention pour le moment. Les actions réalisées sur votre site apparaîtront ici.</p>}</section>;
}
type RequiredAction = { kind: "payment" | "appointment" | "reply"; label: string; text: string; href?: string; cta: string };
function requiredAction(update: UpdateRecord): RequiredAction {
  const action = (update.action_type ?? "").toLowerCase();
  const content = `${update.title} ${update.description}`.toLowerCase();
  if (["paiement", "payment", "checkout"].some((value) => action.includes(value)) || /paiement|payer|règlement|reglement|abonnement/.test(content)) return { kind: "payment", label: "Finaliser votre abonnement", text: "Votre abonnement FeaseWeb est prêt à être activé.", cta: "Payer mon abonnement" };
  if (["rendez_vous", "rendez-vous", "appointment"].some((value) => action.includes(value)) || /rendez[- ]vous|créneau|creneau/.test(content)) return { kind: "appointment", label: "Planifier votre rendez-vous", text: "Choisissez un moment pour parler de votre projet.", href: "#rendez-vous", cta: "Choisir mon rendez-vous" };
  return { kind: "reply", label: "FeaseWeb a besoin de vous", text: update.description || update.title, href: "#message-client", cta: "Répondre" };
}
function ActionRequired({ projectComplete, approved, paymentConfirmed, appointment, updates }: { projectComplete: boolean; approved: boolean; paymentConfirmed: boolean; appointment?: ClientSpaceSectionsProps["appointment"]; updates: UpdateRecord[] }) {
  const items: RequiredAction[] = [];
  const unreadAction = updates.find((update) => update.update_type === "action_requise" && !update.read_at);
  if (unreadAction) items.push(requiredAction(unreadAction));
  else if (!projectComplete) items.push({ kind: "reply", label: "Finaliser votre demande", text: "Quelques informations manquent encore.", href: "/creer-mon-site", cta: "Continuer" });
  else if (!appointment?.appointment_status || appointment.appointment_status === "cancelled") items.push({ kind: "appointment", label: "Planifier votre rendez-vous", text: "Choisissez un moment pour parler de votre projet.", href: "#rendez-vous", cta: "Choisir mon rendez-vous" });
  else if (approved && !paymentConfirmed) items.push({ kind: "payment", label: "Finaliser votre abonnement", text: "49 € / mois", cta: "Payer mon abonnement" });
  const item = items[0];
  return <aside className="client-next-action" aria-labelledby="client-next-action-title"><p className="client-eyebrow">PROCHAINE ÉTAPE</p>{item ? <><h2 id="client-next-action-title">{item.label}</h2><p>{item.text}</p>{item.kind === "payment" ? <StartSubscriptionButton label={item.cta} /> : <a className="client-button" href={item.href}>{item.cta} <ArrowUpRightIcon size={16} /></a>}</> : <><h2 id="client-next-action-title">Tout est à jour ✓</h2><p>Vous n&apos;avez rien à faire pour le moment.</p></>}</aside>;
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
  return <section id="tableau-de-bord" className="client-space-section client-dashboard-section client-simple-dashboard">
    <div className="client-project-grid"><section id="mon-site" className="client-card client-main-site-card" aria-labelledby="client-main-site-title"><div className="client-project-card-icon"><GlobeIcon /></div><p className="client-eyebrow">MON SITE</p><h2 id="client-main-site-title">{site?.name || "Votre site internet"}</h2><h3>{live ? "Votre site est en ligne ✓" : siteUrl ? "Votre site est en construction" : "Votre site est en préparation"}</h3>{siteUrl ? <><p className="client-site-url">{siteUrlLabel}</p><a className="client-button" href={siteUrl} target="_blank" rel="noreferrer">Voir mon site <ArrowUpRightIcon size={16} /></a></> : <p className="client-muted-note">{deliveryEstimate ? `Livraison estimée : ${formatClientDate(deliveryEstimate)}` : "FeaseWeb prépare actuellement votre projet."}</p>}<div className="client-project-meta"><span>État <strong>{live ? "En ligne" : siteUrl ? "En construction" : "En préparation"}</strong></span>{site?.launched_at && <span>Mise en ligne <strong>{date(site.launched_at)}</strong></span>}</div></section><ActionRequired projectComplete={projectComplete} approved={approved} paymentConfirmed={paymentConfirmed} appointment={appointment} updates={updates} /></div>
    <section className="client-card client-project-status-card"><p className="client-eyebrow">VOTRE PARCOURS</p><ProjectTimeline project={project} appointment={appointment} paymentConfirmed={paymentConfirmed} paymentDate={firstPayment?.created_at} live={live} /></section>
    <div className="client-dashboard-grid"><div id="rendez-vous"><div className="client-card-icon"><CalendarIcon /></div><ClientAppointmentCard initialAppointment={appointment ?? null} /></div><section id="paiement" className="client-card client-payment-status"><CreditCardIcon /><p className="client-eyebrow">ABONNEMENT</p><h2>{paymentConfirmed ? "Abonnement actif ✓" : approved ? "Votre abonnement FeaseWeb" : "Abonnement"}</h2>{paymentConfirmed ? <p className="client-muted-note">49 €/mois · Paiement confirmé.</p> : approved ? <><p className="client-price">49 €<span>/mois</span></p><StartSubscriptionButton label="Payer mon abonnement" /><p className="client-footnote">Création ou refonte du site, hébergement, maintenance et suivi.</p></> : <p className="client-muted-note">Il sera disponible lorsque votre dossier sera prêt.</p>}</section></div>
    <WorkHistory actions={seoActions} updates={updates} />
     <section id="contact" className="client-contact-panel" aria-labelledby="client-contact-title"><MessageIcon /><div className="client-contact-intro"><p className="client-eyebrow">BESOIN DE NOUS ?</p><h2 id="client-contact-title">Une question ou une modification concernant votre site ?</h2></div><div className="client-contact-actions"><ClientRequestForm compact supportOnly openHash="message-client" />{client && <ClientRequestForm compact label="Faire une demande de modification" />}<a className="client-contact-whatsapp" href={whatsappContactUrl} target="_blank" rel="noopener noreferrer">Besoin d&apos;une réponse rapide ? <strong>WhatsApp →</strong></a></div>{openRequests.length > 0 && <div className="client-request-list">{openRequests.map((request) => <RequestItem key={request.id} request={request} />)}</div>}</section>
  </section>;
}
