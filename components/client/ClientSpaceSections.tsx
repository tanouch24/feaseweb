/* eslint-disable react/no-unescaped-entities */
import { ClientRequestForm } from "@/components/client/ClientRequestForm";
import { ManageSubscriptionButton, StartSubscriptionButton } from "@/components/billing/BillingActions";
import { isOnboardingComplete, onboardingLabels, projectTimeline, type OnboardingProject, type ProjectTimelineStage } from "@/lib/onboarding";
import type { ProductionCompleteness } from "@/lib/production";

type ClientRecord = { first_name: string | null; last_name: string | null; company: string; email: string; phone: string | null; status: string; started_at: string | null };
type ProfileRecord = { first_name?: string | null; last_name?: string | null; email?: string | null } | null;
type SiteRecord = { id: string; name: string; domain: string | null; preview_url: string | null; production_url: string | null; status: string; created_at: string | null; launched_at: string | null } | null;
type SubscriptionRecord = { status: string; amount_cents: number; currency: string; next_billing_at: string | null; cancel_at_period_end: boolean; canceled_at: string | null; provider: string } | null;
type PaymentRecord = { id: string; amount_cents: number; status: string; created_at: string; invoice_reference: string | null; period_start: string | null; period_end: string | null };
type UpdateRecord = { id: string; category: string; title: string; description: string; status: string; activity_date: string; created_at: string };
type RequestRecord = { id: string; title: string; category: string; message: string; status: string; created_at: string; resolved_at: string | null };
type SeoActionRecord = { id: string; date: string; action: string; description: string | null; status: string };
type SeoMetricRecord = { id: string; clicks: number | null; impressions: number | null; ctr: number | null; average_position: number | null; synced_at: string | null };

export type ClientSpaceSectionsProps = {
  client: ClientRecord;
  profile: ProfileRecord;
  project: OnboardingProject | null;
  site: SiteRecord;
  subscription: SubscriptionRecord;
  payments: PaymentRecord[];
  updates: UpdateRecord[];
  requests: RequestRecord[];
  seoActions: SeoActionRecord[];
  seoMetrics: SeoMetricRecord[];
};

const labels: Record<string, string> = {
  a_preparer: "À préparer", en_creation: "En création", preview: "Aperçu à valider", corrections: "Corrections en cours", valide: "Validé", mise_en_ligne: "Mise en ligne", actif: "En ligne", suspendu: "En pause", archive: "Archivé",
  incomplet: "En attente de paiement", essai: "Période d'essai", retard: "Paiement en retard", impaye: "Impayé", annule: "Annulé", incomplet_expire: "Paiement expiré", en_pause: "En pause",
  recue: "Reçue", en_cours: "En cours", besoin_information: "Information demandée", terminee: "Terminée", hors_perimetre: "Hors périmètre", prevu: "Prévu", termine: "Terminé", seo: "SEO", contenu: "Contenu", maintenance: "Maintenance", site: "Site", securite: "Sécurité", autre: "Autre", paye: "Payé", en_attente: "En attente", echoue: "Échoué", rembourse: "Remboursé",
  project_configured: "Projet configuré", subscription_active: "Abonnement actif", preparation: "Préparation", building: "Création du site", preview_ready: "Aperçu disponible", client_feedback: "Vos retours", finalizing: "Finalisation", live: "En ligne",
};

const label = (value: string | null | undefined) => value ? labels[value] ?? onboardingLabels[value] ?? value : null;
const date = (value: string | null | undefined) => value ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value)) : null;
const money = (cents: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);

function SectionHeading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return <div className="client-section-heading"><p className="client-eyebrow">{eyebrow}</p><h2>{title}</h2>{detail && <p>{detail}</p>}</div>;
}

function DataRows({ rows }: { rows: Array<[string, string | null | undefined]> }) {
  const visible = rows.filter(([, value]) => value);
  if (!visible.length) return <p className="client-muted-note">Aucune information renseignée pour le moment.</p>;
  return <dl className="client-data-rows">{visible.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>;
}

function TimelineItem({ stage, index }: { stage: ProjectTimelineStage; index: number }) {
  const state = stage.state === "complete" ? "Terminée" : stage.state === "current" ? "Étape actuelle" : "À venir";
  return <li className={`client-project-timeline-item ${stage.state}`}><span className="client-project-timeline-mark" aria-hidden="true">{stage.state === "complete" ? "✓" : index + 1}</span><span><strong>{stage.label}</strong><small>{state}</small></span></li>;
}

function ProjectTimeline({ project }: { project: OnboardingProject | null }) {
  if (!project) return <div className="client-empty compact"><p>Le statut détaillé du projet apparaîtra ici dès que le dossier sera associé.</p></div>;
  return <ol className="client-project-timeline">{projectTimeline(project.projectStatus, isOnboardingComplete(project)).map((stage, index) => <TimelineItem key={stage.key} stage={stage} index={index} />)}</ol>;
}

function UpdateItem({ update }: { update: UpdateRecord }) {
  return <article className="client-update"><div className="client-update-date">{date(update.activity_date)}</div><div className="client-update-mark" /><div><p className="client-update-category">{label(update.category)}</p><h3>{update.title}</h3><p>{update.description}</p><span className={`client-chip ${update.status}`}>{label(update.status)}</span></div></article>;
}

function RequestItem({ request }: { request: RequestRecord }) {
  return <article className="client-request-row"><div><strong>{request.title || label(request.category) || request.category}</strong><p>{request.message}</p><small>{date(request.created_at)}{request.resolved_at ? ` · Terminée le ${date(request.resolved_at)}` : ""}</small></div><span className={`client-chip ${request.status}`}>{label(request.status)}</span></article>;
}

export function ClientSpaceNavigation() {
  return <nav className="client-space-nav" aria-label="Navigation de l'espace client"><a href="#tableau-de-bord" className="active">Tableau de bord</a><a href="#mon-entreprise">Mon entreprise</a><a href="#mon-site">Mon site</a><a href="#seo-visibilite">SEO &amp; visibilité</a><a href="#abonnement-factures">Abonnement &amp; factures</a><a href="#support-demandes">Support / demandes</a></nav>;
}

export function ProductionDossierCard({ completeness }: { completeness: ProductionCompleteness | null }) {
  const score = completeness?.score ?? 0;
  return <section className="client-card production-dashboard-card"><div><p className="client-eyebrow">PRÉPARATION DU PROJET</p><h2>Préparons votre site</h2><p>{completeness?.readyForBuild ? "Votre dossier contient les informations nécessaires pour démarrer la création." : "Complétez les informations utiles à la création de votre site."}</p>{completeness && completeness.blockersForBuild.length > 0 && <p className="production-blocker-note">{completeness.blockersForBuild.length} information{completeness.blockersForBuild.length > 1 ? "s" : ""} nécessaire{completeness.blockersForBuild.length > 1 ? "s" : ""} reste{completeness.blockersForBuild.length > 1 ? "nt" : ""} à préciser.</p>}</div><div className="production-dashboard-progress"><strong>{score} %</strong><span>Dossier de production</span><div><i style={{ width: `${score}%` }} /></div><a className="client-button" href="/espace-client/production">{completeness?.readyForBuild ? "Consulter mon dossier" : "Continuer mon dossier"}</a></div></section>;
}

export function ClientSpaceSections({ client, profile, project, site, subscription, payments, updates, requests, seoActions, seoMetrics }: ClientSpaceSectionsProps) {
  const openRequests = requests.filter((request) => !["terminee", "hors_perimetre"].includes(request.status));
  const nextUpdate = updates.find((update) => update.status !== "termine");
  const latestUpdates = updates.slice(0, 3);
  const metrics = seoMetrics[0];
  const hasMetric = metrics && [metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_position].some((value) => value !== null && value !== undefined);
  const firstName = client.first_name || profile?.first_name || "";
  const fullName = [client.first_name || profile?.first_name, client.last_name || profile?.last_name].filter(Boolean).join(" ");
  const requestedPages = project?.requestedPages.length ? project.requestedPages.map((item) => item === "rendez_vous" ? "Prise de rendez-vous" : onboardingLabels[item] ?? item).join(", ") : null;
  const assets = project?.availableAssets.length ? project.availableAssets.map((item) => onboardingLabels[item] ?? item).join(", ") : null;
  const projectType = project ? (project.hasExistingSite ? onboardingLabels[project.existingSiteProject ?? ""] ?? project.existingSiteProject : "Création d'un nouveau site") : null;
  return <>
    <ClientSpaceNavigation />
    <section id="tableau-de-bord" className="client-space-section client-dashboard-section">
      <SectionHeading eyebrow="TABLEAU DE BORD" title={site?.name ? `Le suivi de ${site.name}` : `Bonjour${firstName ? ` ${firstName}` : ""}.`} detail="Retrouvez ici l'état réel de votre projet et les dernières interventions de FeaseWeb." />
      <div className="client-dashboard-overview">
        <section className="client-card client-project-status-card"><div className="client-card-heading"><div><p className="client-eyebrow">ÉTAT DU PROJET</p><h3>{project ? label(project.projectStatus) : site ? label(site.status) : "Dossier client"}</h3></div>{site?.production_url && <a className="client-button" href={site.production_url} target="_blank" rel="noreferrer">Voir mon site ↗</a>}</div><ProjectTimeline project={project} /></section>
        <section className="client-card client-next-step-card"><SectionHeading eyebrow="À FAIRE ENSUITE" title="Prochaine étape" />{nextUpdate ? <div className="client-next-step"><span className="client-chip">{label(nextUpdate.status)}</span><strong>{nextUpdate.title}</strong><p>{nextUpdate.description}</p></div> : <p className="client-muted-note">Aucune prochaine intervention n'est enregistrée pour le moment.</p>}</section>
        <section className="client-card"><SectionHeading eyebrow="APERÇU" title="Votre site" />{site?.preview_url ? <><p className="client-card-lead">Une version de votre site est disponible pour consultation.</p><a className="client-button secondary" href={site.preview_url} target="_blank" rel="noreferrer">Ouvrir l'aperçu ↗</a></> : <p className="client-muted-note">Aucun aperçu n'est encore enregistré.</p>}</section>
        <section className="client-card"><SectionHeading eyebrow="ABONNEMENT" title="Votre formule" />{subscription ? <><p className="client-price">{money(subscription.amount_cents)}<span>/mois</span></p><p className="client-muted-note">{label(subscription.status)}</p></> : <p className="client-muted-note">Aucun abonnement enregistré.</p>}</section>
      </div>
      <section className="client-card client-activity-card client-dashboard-activity"><SectionHeading eyebrow="DERNIÈRES ACTIONS FEASEWEB" title="Ce qui a été fait" />{latestUpdates.length ? <div className="client-update-list">{latestUpdates.map((update) => <UpdateItem key={update.id} update={update} />)}</div> : <div className="client-empty compact"><p>Aucune intervention visible n'est encore enregistrée.</p></div>}</section>
      <section className="client-card client-dashboard-requests"><SectionHeading eyebrow="DEMANDES OUVERTES" title={`${openRequests.length} demande${openRequests.length > 1 ? "s" : ""} en cours`} />{openRequests.length ? <div className="client-request-list">{openRequests.slice(0, 3).map((request) => <RequestItem key={request.id} request={request} />)}</div> : <p className="client-muted-note">Aucune demande ouverte.</p>}<a className="client-text-link" href="#support-demandes">Voir le support et l'historique →</a></section>
    </section>

    <section id="mon-entreprise" className="client-space-section">
      <SectionHeading eyebrow="MON ENTREPRISE" title="Les informations de votre dossier" detail="Cette vue reprend uniquement les informations déjà enregistrées dans votre espace FeaseWeb." />
      <section className="client-card"><DataRows rows={[["Nom", fullName], ["Entreprise", client.company], ["Activité", project?.activity ? onboardingLabels[project.activity] ?? project.activity : null], ["Email", client.email || profile?.email], ["Téléphone", client.phone], ["Site internet actuel", project?.existingSiteUrl], ["Projet", projectType], ["Objectif principal", project?.primaryObjective ? onboardingLabels[project.primaryObjective] ?? project.primaryObjective : null]]} /><p className="client-muted-note client-section-note">Une modification de coordonnées peut être demandée à FeaseWeb depuis le support. Les champs non présents dans la base ne sont pas affichés.</p><a className="client-text-link" href="#support-demandes">Demander une mise à jour →</a></section>
    </section>

    <section id="mon-site" className="client-space-section">
      <SectionHeading eyebrow="MON SITE" title="Configuration et production" detail="Le suivi s'appuie sur votre configuration et sur le statut réellement renseigné par FeaseWeb." />
      <div className="client-section-grid"><section className="client-card"><SectionHeading eyebrow="CONFIGURATION" title="Votre projet" />{project ? <DataRows rows={[["Création / refonte", projectType], ["Objectif", project.primaryObjective ? onboardingLabels[project.primaryObjective] ?? project.primaryObjective : null], ["Pages demandées", requestedPages], ["Style", project.styleDirection ? onboardingLabels[project.styleDirection] ?? project.styleDirection : null], ["Couleurs", project.colorMood ? onboardingLabels[project.colorMood] ?? project.colorMood : null], ["Éléments fournis", assets]]} /> : <p className="client-muted-note">Aucune configuration de projet n'est associée à ce compte.</p>}{project?.projectStatus === "project_configured" && <a className="client-text-link" href="/creer-mon-site">Modifier ma configuration →</a>}</section><section className="client-card"><SectionHeading eyebrow="PRODUCTION" title={site?.name ?? "Votre site"} />{site ? <><DataRows rows={[["Statut", label(site.status)], ["Domaine", site.domain], ["Créé le", date(site.created_at)], ["Mis en ligne le", date(site.launched_at)]]} /><div className="client-site-links">{site.preview_url && <a className="client-button secondary" href={site.preview_url} target="_blank" rel="noreferrer">Ouvrir l'aperçu ↗</a>}{site.production_url && <a className="client-button" href={site.production_url} target="_blank" rel="noreferrer">Voir le site ↗</a>}</div></> : <p className="client-muted-note">Aucun site n'est encore associé à ce dossier.</p>}</section></div>
    </section>

    <section id="seo-visibilite" className="client-space-section">
      <SectionHeading eyebrow="SEO & VISIBILITÉ" title="Le travail de référencement réalisé" detail="Le journal ci-dessous reprend uniquement les actions SEO enregistrées par FeaseWeb." />
      <section className="client-card client-seo-journal"><SectionHeading eyebrow="JOURNAL DES ACTIONS SEO" title="Interventions enregistrées" />{seoActions.length ? <div className="client-seo-list">{seoActions.map((action) => <article className="client-seo-entry" key={action.id}><div className="client-seo-entry-meta"><span>{date(action.date)}</span><span className={`client-chip ${action.status}`}>{label(action.status)}</span></div><h3>{action.action}</h3>{action.description && <p>{action.description}</p>}</article>)}</div> : <div className="client-empty compact"><p>Aucune action SEO n&apos;a encore été enregistrée. Les interventions réalisées par FeaseWeb apparaîtront ici.</p></div>}</section>
      {hasMetric && <section className="client-card client-seo-metrics"><SectionHeading eyebrow="VISIBILITÉ" title="Dernières métriques disponibles" detail={metrics.synced_at ? `Données synchronisées le ${date(metrics.synced_at)}.` : undefined} /><div className="client-metric-grid">{metrics.clicks !== null && metrics.clicks !== undefined && <div><strong>{metrics.clicks}</strong><span>Clics</span></div>}{metrics.impressions !== null && metrics.impressions !== undefined && <div><strong>{metrics.impressions}</strong><span>Impressions</span></div>}{metrics.ctr !== null && metrics.ctr !== undefined && <div><strong>{metrics.ctr}%</strong><span>Taux de clic</span></div>}{metrics.average_position !== null && metrics.average_position !== undefined && <div><strong>{metrics.average_position}</strong><span>Position moyenne</span></div>}</div></section>}
    </section>

    <section id="abonnement-factures" className="client-space-section">
      <SectionHeading eyebrow="ABONNEMENT & FACTURES" title="Votre formule FeaseWeb" detail="Retrouvez le statut et l'historique déjà enregistrés pour votre abonnement." />
      <section className="client-card client-billing-card"><div><p className="client-eyebrow">FORMULE ACTUELLE</p><h3>FeaseWeb</h3><p className="client-price">{subscription ? money(subscription.amount_cents) : "49 €"}<span>/mois</span></p>{subscription ? <p className="client-muted-note">Statut : {label(subscription.status)}{subscription.next_billing_at ? ` · prochaine échéance ${date(subscription.next_billing_at)}` : ""}</p> : <p className="client-muted-note">Aucun abonnement enregistré.</p>}</div><div>{subscription ? <ManageSubscriptionButton /> : <StartSubscriptionButton />}<p className="client-footnote">Les paiements et factures sont gérés de manière sécurisée par Stripe.</p></div></section>
      <section className="client-card"><SectionHeading eyebrow="PAIEMENTS" title="Historique des factures" />{payments.length ? <div className="client-payments">{payments.map((payment) => <div key={payment.id}><span>{date(payment.created_at)}</span><strong>{money(payment.amount_cents)}</strong><small>{label(payment.status)}{payment.invoice_reference ? ` · ${payment.invoice_reference}` : ""}</small></div>)}</div> : <div className="client-empty compact"><p>Aucun paiement ou facture n'est encore enregistré.</p></div>}</section>
    </section>

    <section id="support-demandes" className="client-space-section client-support-section">
      <SectionHeading eyebrow="SUPPORT / DEMANDES" title="Besoin d'une modification ?" detail="Créez une demande et suivez son statut dans le même espace." />
      <div className="client-request-layout"><section className="client-card"><SectionHeading eyebrow="HISTORIQUE" title="Vos demandes" />{requests.length ? <div className="client-request-list">{requests.map((request) => <RequestItem key={request.id} request={request} />)}</div> : <div className="client-empty compact"><p>Aucune demande pour le moment.</p></div>}</section><ClientRequestForm /></div>
    </section>
  </>;
}
