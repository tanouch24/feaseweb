"use client";

import { useState } from "react";
import { StartSubscriptionButton } from "@/components/billing/BillingActions";
import { completedOnboardingSteps, isOnboardingComplete, type OnboardingProject } from "@/lib/onboarding";

const stages = ["Espace créé", "Projet configuré", "Abonnement", "Préparation", "Création", "Première version", "Vos retours", "Finalisation", "Mise en ligne"];
const included = ["Création complète de votre site", "Design adapté à votre activité", "Version mobile", "Hébergement", "Certificat SSL", "Maintenance technique", "Sauvegardes et sécurité", "Modifications courantes", "Formulaire de contact", "Référencement SEO", "Suivi de visibilité", "Support FeaseWeb"];

export function ProspectProjectDashboard({ project }: { project: OnboardingProject }) {
  const [message, setMessage] = useState(""); const [sent, setSent] = useState(false); const [loading, setLoading] = useState(false);
  const complete = isOnboardingComplete(project); const completed = completedOnboardingSteps(project); const resumeLabel = completed === 0 ? "Commencer la configuration" : "Continuer la configuration";
  async function ask() { setLoading(true); const response = await fetch("/api/onboarding/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) }); setLoading(false); if (response.ok) { setSent(true); setMessage(""); } }
  const active = complete ? 1 : 0;
  return <main className="client-space"><header className="client-header"><div><p className="client-eyebrow">VOTRE PROJET FEASEWEB</p><h1>Bonjour{project.firstName ? ` ${project.firstName}` : ""}.</h1><p>{complete ? "Votre projet est configuré. FeaseWeb prépare la suite avec vous." : "Configurez votre projet pour que FeaseWeb puisse préparer la suite avec vous."}</p></div></header>
    <section className="client-hero-card"><div><p className="client-eyebrow">PROJET</p><h2>{project.company}</h2><p>{project.hasExistingSite ? "Refonte de votre site actuel" : "Création d'un nouveau site"}</p></div><div className="client-status-block"><span>État</span><strong>{complete ? "Projet configuré" : "Projet à configurer"}</strong></div></section>
    {!complete && <section className="client-card client-project-progress"><p className="client-eyebrow">CONFIGURATION</p><h2>{completed} étape{completed > 1 ? "s" : ""} sur 8 terminée{completed > 1 ? "s" : ""}</h2><p className="mt-2 text-ink-soft">Vos réponses sont sauvegardées au fil du parcours.</p><a href="/creer-mon-site" className="mt-5 inline-flex rounded-sm bg-brand px-5 py-3 font-medium text-white">{resumeLabel}</a></section>}
    {complete && <section className="client-card client-project-progress"><p className="client-eyebrow">SUIVI DE CRÉATION</p><h2>Les prochaines étapes</h2><div className="project-stage-list">{stages.map((stage, index) => <div key={stage} className={index <= active ? "complete" : ""}><span>{index <= active ? "✓" : "○"}</span>{stage}</div>)}</div></section>}
    {complete && <section className="client-card client-offer-card"><p className="client-eyebrow">TOUT EST COMPRIS</p><h2>Tout est compris avec FeaseWeb</h2><ul className="client-included-list">{included.map((item) => <li key={item}>✓ {item}</li>)}</ul><p className="client-price">49 €<span>/mois</span></p><p className="client-free-creation">0 € de frais de création</p><StartSubscriptionButton /></section>}
    <section className="client-card client-support"><h2>Une question avant de démarrer ?</h2><p>Écrivez-nous depuis votre espace, sans quitter votre projet.</p><textarea aria-label="Question à FeaseWeb" value={message} onChange={(e) => setMessage(e.target.value)} className="mt-4 w-full rounded-sm border border-line p-3" rows={4} placeholder="Votre question" /><button type="button" disabled={!message.trim() || loading} onClick={() => void ask()} className="mt-3 rounded-sm border border-brand px-4 py-2 text-sm font-medium text-brand disabled:opacity-50">{loading ? "Envoi…" : "J'ai une question avant de démarrer"}</button>{sent && <p className="mt-2 text-sm text-brand">Votre demande a bien été transmise à FeaseWeb.</p>}</section>
  </main>;
}
