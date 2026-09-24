"use client";

import { useState } from "react";
import { StartSubscriptionButton } from "@/components/billing/BillingActions";
import { completedOnboardingSteps, isOnboardingComplete, onboardingLabels, projectTimeline, type OnboardingProject, type ProjectTimelineStage } from "@/lib/onboarding";

const included = ["Création complète", "Design adapté", "Version mobile", "Hébergement + SSL", "Maintenance", "Sauvegardes et sécurité", "Modifications courantes", "Formulaire de contact", "Référencement SEO", "Suivi de visibilité", "Support FeaseWeb"];

function valueLabel(value: string, type: "page" | "default" = "default") {
  if (type === "page" && value === "rendez_vous") return "Prise de rendez-vous";
  return onboardingLabels[value] ?? value;
}

function Timeline({ status, complete }: { status: string; complete: boolean }) {
  const stages = projectTimeline(status, complete);
  return <section className="client-card prospect-timeline" aria-labelledby="project-timeline-title">
    <div className="client-card-heading"><div><p className="client-eyebrow">VOTRE PARCOURS</p><h2 id="project-timeline-title">Les étapes de votre projet</h2></div></div>
    <ol className="project-timeline-list">
      {stages.map((stage, index) => <TimelineItem key={stage.key} stage={stage} index={index} />)}
    </ol>
  </section>;
}

function TimelineItem({ stage, index }: { stage: ProjectTimelineStage; index: number }) {
  const stateLabel = stage.state === "complete" ? "Terminée" : stage.state === "current" ? "Étape actuelle" : "À venir";
  return <li className={`project-timeline-item ${stage.state}`}>
    <span className="project-timeline-marker" aria-hidden="true">{stage.state === "complete" ? "✓" : index + 1}</span>
    <span className="project-timeline-copy"><strong>{stage.label}</strong><small>{stateLabel}</small></span>
  </li>;
}

function SummaryRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return <div className="prospect-summary-row"><dt>{label}</dt><dd>{value}</dd></div>;
}

function ProjectSummary({ project }: { project: OnboardingProject }) {
  const projectType = project.hasExistingSite ? valueLabel(project.existingSiteProject ?? "") : "Création d'un nouveau site";
  const assets = project.availableAssets.length ? project.availableAssets.map((asset) => valueLabel(asset)).join(", ") : null;
  const pages = project.requestedPages.length ? project.requestedPages.map((page) => valueLabel(page, "page")).join(", ") : null;
  return <section className="client-card prospect-summary" aria-labelledby="project-summary-title">
    <div className="client-card-heading"><div><p className="client-eyebrow">VOTRE PROJET</p><h2 id="project-summary-title">Votre configuration</h2></div><a href="/creer-mon-site" className="client-text-link">Modifier ma configuration <span aria-hidden="true">↗</span></a></div>
    <dl className="prospect-summary-list">
      <SummaryRow label="Activité" value={valueLabel(project.activity ?? "")} />
      <SummaryRow label="Projet" value={projectType} />
      <SummaryRow label="Objectif principal" value={valueLabel(project.primaryObjective ?? "")} />
      <SummaryRow label="Style sélectionné" value={valueLabel(project.styleDirection ?? "")} />
      <SummaryRow label="Palette / couleurs" value={valueLabel(project.colorMood ?? "")} />
      <SummaryRow label="Pages demandées" value={pages} />
      <SummaryRow label="Éléments déjà disponibles" value={assets} />
    </dl>
  </section>;
}

function SubscriptionCard() {
  return <section className="client-card prospect-subscription" aria-labelledby="subscription-title">
    <div className="prospect-subscription-heading"><div><p className="client-eyebrow">ABONNEMENT</p><h2 id="subscription-title">Activez votre abonnement pour lancer la création</h2><p className="prospect-subscription-intro">Votre site sera créé à partir de la configuration que vous venez de valider.</p></div><div className="prospect-price"><strong>49 €</strong><span>/mois</span></div></div>
    <p className="client-free-creation">0 € de frais de création</p>
    <ul className="client-included-list">{included.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
    <div className="prospect-subscription-action"><StartSubscriptionButton label="Activer mon abonnement — 49 €/mois" /><p>Votre abonnement est mensuel. La création de votre site démarre après confirmation du paiement.</p></div>
  </section>;
}

export function ProspectProjectDashboard({ project, checkout }: { project: OnboardingProject; checkout?: string }) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const complete = isOnboardingComplete(project);
  const completed = completedOnboardingSteps(project);
  const resumeLabel = completed === 0 ? "Commencer la configuration" : "Continuer la configuration";
  async function ask() {
    setLoading(true);
    const response = await fetch("/api/onboarding/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
    setLoading(false);
    if (response.ok) { setSent(true); setMessage(""); }
  }
  return <main className="client-space prospect-space">
    <header className="client-header"><div><p className="client-eyebrow">VOTRE ESPACE FEASEWEB</p><h1>{complete ? "Votre projet est configuré" : `Bonjour${project.firstName ? ` ${project.firstName}` : ""}.`}</h1><p>{complete ? "Nous avons toutes les informations nécessaires pour préparer votre site." : "Configurez votre projet pour que FeaseWeb puisse préparer la suite avec vous."}</p></div></header>
    {checkout === "success" && <div className="client-alert" role="status">Votre demande d&apos;abonnement a bien été reçue. Le statut se met à jour après confirmation de Stripe.</div>}
    {checkout === "cancelled" && <div className="client-alert muted" role="status">Le paiement a été annulé. Votre configuration est conservée.</div>}
    {!complete && <section className="client-card client-project-progress"><p className="client-eyebrow">CONFIGURATION EN COURS</p><h2>{completed} étape{completed > 1 ? "s" : ""} sur 8 terminée{completed > 1 ? "s" : "e"}</h2><p className="mt-2 text-ink-soft">Vos réponses sont sauvegardées au fil du parcours.</p><a href="/creer-mon-site" className="mt-5 inline-flex rounded-sm bg-brand px-5 py-3 font-medium text-white">{resumeLabel}</a></section>}
    {complete && <>
      <section className="prospect-confirmation" aria-label="Configuration terminée"><span className="prospect-confirmation-mark" aria-hidden="true">✓</span><div><p className="client-eyebrow">CONFIGURATION ENREGISTRÉE</p><h2>Votre projet est configuré</h2><p>Nous avons toutes les informations nécessaires pour préparer votre site.</p></div></section>
      <Timeline status={project.projectStatus} complete />
      <ProjectSummary project={project} />
      <SubscriptionCard />
    </>}
    <section className="client-card client-support prospect-support"><h2>Une question avant de démarrer ?</h2><p>Écrivez-nous depuis votre espace, sans quitter votre projet.</p><textarea aria-label="Question à FeaseWeb" value={message} onChange={(e) => setMessage(e.target.value)} className="mt-4 w-full rounded-sm border border-line p-3" rows={4} placeholder="Votre question" /><button type="button" disabled={!message.trim() || loading} onClick={() => void ask()} className="mt-3 rounded-sm border border-brand px-4 py-2 text-sm font-medium text-brand disabled:opacity-50">{loading ? "Envoi…" : "J'ai une question avant de démarrer"}</button>{sent && <p className="mt-2 text-sm text-brand" role="status">Votre demande a bien été transmise à FeaseWeb.</p>}</section>
  </main>;
}
