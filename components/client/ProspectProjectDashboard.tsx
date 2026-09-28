"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from "react";
import { StartSubscriptionButton } from "@/components/billing/BillingActions";
import { completedOnboardingSteps, isOnboardingComplete, onboardingLabels, projectTimeline, type OnboardingProject, type ProjectTimelineStage } from "@/lib/onboarding";
import type { ProjectAppointment, ProjectReview } from "@/lib/project-review";
import { trackEvent } from "@/lib/analytics";
import { TrackingEvent } from "@/components/analytics/TrackingEvent";

const included = ["Création complète", "Design adapté", "Version mobile", "Hébergement + SSL", "Maintenance", "Sauvegardes et sécurité", "Modifications courantes", "Formulaire de contact", "Référencement SEO", "Suivi de visibilité", "Support FeaseWeb"];

function valueLabel(value: string, type: "page" | "default" = "default") {
  if (type === "page" && value === "rendez_vous") return "Prise de rendez-vous";
  return onboardingLabels[value] ?? value;
}

function Timeline({ status, complete, review }: { status: string; complete: boolean; review: ProjectReview }) {
  const stages = projectTimeline(status, complete, review.appointment?.status, review.validation.status);
  return <section className="client-card prospect-timeline" aria-labelledby="project-timeline-title">
    <div className="client-card-heading"><div><p className="client-eyebrow">VOTRE PARCOURS</p><h2 id="project-timeline-title">Les étapes de votre projet</h2></div></div>
    <ol className="project-timeline-list">{stages.map((stage, index) => <TimelineItem key={stage.key} stage={stage} index={index} />)}</ol>
  </section>;
}

function TimelineItem({ stage, index }: { stage: ProjectTimelineStage; index: number }) {
  const stateLabel = stage.state === "complete" ? "Terminée" : stage.state === "current" ? "Étape actuelle" : "À venir";
  return <li className={`project-timeline-item ${stage.state}`}><span className="project-timeline-marker" aria-hidden="true">{stage.state === "complete" ? "✓" : index + 1}</span><span className="project-timeline-copy"><strong>{stage.label}</strong><small>{stateLabel}</small></span></li>;
}

function SummaryRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return <div className="prospect-summary-row"><dt>{label}</dt><dd>{value}</dd></div>;
}

function ProjectSummary({ project }: { project: OnboardingProject }) {
  const projectType = project.hasExistingSite ? valueLabel(project.existingSiteProject ?? "") : "Création d'un nouveau site";
  const assets = project.availableAssets.length ? project.availableAssets.map((asset) => valueLabel(asset)).join(", ") : null;
  const pages = project.requestedPages.length ? project.requestedPages.map((page) => valueLabel(page, "page")).join(", ") : null;
  return <section className="client-card prospect-summary" aria-labelledby="project-summary-title"><div className="client-card-heading"><div><p className="client-eyebrow">VOTRE PROJET</p><h2 id="project-summary-title">Votre configuration</h2></div><a href="/creer-mon-site" className="client-text-link">Modifier ma configuration <span aria-hidden="true">↗</span></a></div><dl className="prospect-summary-list"><SummaryRow label="Activité" value={valueLabel(project.activity ?? "")} /><SummaryRow label="Projet" value={projectType} /><SummaryRow label="Objectif principal" value={valueLabel(project.primaryObjective ?? "")} /><SummaryRow label="Style sélectionné" value={valueLabel(project.styleDirection ?? "")} /><SummaryRow label="Palette / couleurs" value={valueLabel(project.colorMood ?? "")} /><SummaryRow label="Pages demandées" value={pages} /><SummaryRow label="Éléments déjà disponibles" value={assets} /></dl></section>;
}

function formatAppointment(appointment: ProjectAppointment) {
  if (!appointment.date || !appointment.time) return "";
  return `${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(new Date(`${appointment.date}T12:00:00`))} à ${appointment.time}`;
}

function AppointmentCard({ project, review, onChange }: { project: OnboardingProject; review: ProjectReview; onChange: (appointment: ProjectAppointment | null) => void }) {
  const existing = review.appointment;
  const [date, setDate] = useState(existing?.date ?? "");
  const [time, setTime] = useState(existing?.time ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? project.phone ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scheduled = existing?.status === "scheduled";
  const completed = existing?.status === "completed";

  async function save(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try { const response = await fetch("/api/prospect/appointment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, time, phone, note }) }); const body = await response.json().catch(() => null); if (!response.ok) throw new Error(body?.error ?? "Impossible d'enregistrer le rendez-vous."); if (body?.trackingEventId) trackEvent("appointment_scheduled", body.trackingEventId); onChange(body.appointment); } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible d'enregistrer le rendez-vous."); } finally { setLoading(false); }
  }
  async function cancel() {
    setLoading(true); setError("");
    try { const response = await fetch("/api/prospect/appointment", { method: "DELETE" }); const body = await response.json().catch(() => null); if (!response.ok) throw new Error(body?.error ?? "Impossible d'annuler le rendez-vous."); onChange(body.appointment); } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible d'annuler le rendez-vous."); } finally { setLoading(false); }
  }
  return <section className="client-card prospect-appointment" aria-labelledby="appointment-title"><div className="client-card-heading"><div><p className="client-eyebrow">RENDEZ-VOUS</p><h2 id="appointment-title">Planifiez mon appel de validation</h2></div></div>{completed ? <><p>Votre échange est terminé. Votre projet est maintenant en cours de validation par FeaseWeb.</p><p className="mt-3 text-sm text-ink-soft">Nous vous informerons dès que la validation sera terminée.</p></> : scheduled ? <><p>Votre appel est prévu le <strong>{formatAppointment(existing)}</strong>.</p>{existing.phone && <p className="mt-2 text-sm text-ink-soft">Téléphone : {existing.phone}</p>}<button type="button" className="mt-4 rounded-sm border border-brand px-4 py-2 text-sm font-medium text-brand" disabled={loading} onClick={() => void cancel()}>Annuler mon rendez-vous</button></> : <><p>Avant de démarrer, nous prenons quelques minutes ensemble pour confirmer votre projet, vos besoins et le type de site à créer.</p><form className="mt-5 grid gap-4 sm:grid-cols-3" onSubmit={(event) => void save(event)}><label className="admin-form-label">Date<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label className="admin-form-label">Heure<input required type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><label className="admin-form-label">Téléphone<input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></label><label className="admin-form-label sm:col-span-3">Remarque <span className="text-xs font-normal text-ink-soft">(facultatif)</span><textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Un point que vous souhaitez aborder" /></label><button type="submit" disabled={loading} className="inline-flex w-fit rounded-sm bg-brand px-5 py-3 font-medium text-white disabled:opacity-60">{loading ? "Enregistrement…" : "Planifier mon appel"}</button></form></>}{error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}</section>;
}

function ValidationCard({ review }: { review: ProjectReview }) {
  if (review.validation.status === "approved") return <section className="client-card prospect-validation" aria-labelledby="validation-title"><p className="client-eyebrow">VALIDATION FEASEWEB</p><h2 id="validation-title">Votre projet est validé</h2><p>Tout est prêt pour démarrer la création de votre site.</p></section>;
  if (review.validation.status === "needs_information") return <section className="client-card prospect-validation" aria-labelledby="validation-title"><p className="client-eyebrow">VALIDATION FEASEWEB</p><h2 id="validation-title">Quelques informations sont encore nécessaires</h2><p>FeaseWeb reviendra vers vous pour préciser les éléments nécessaires avant de poursuivre.</p></section>;
  if (review.validation.status === "declined") return <section className="client-card prospect-validation" aria-labelledby="validation-title"><p className="client-eyebrow">VALIDATION FEASEWEB</p><h2 id="validation-title">Votre projet ne peut pas être lancé pour le moment</h2><p>FeaseWeb vous communiquera les éléments utiles concernant la suite de votre demande.</p></section>;
  return <section className="client-card prospect-validation" aria-labelledby="validation-title"><p className="client-eyebrow">VALIDATION FEASEWEB</p><h2 id="validation-title">Votre projet est en cours de validation</h2><p>Nous finalisons les éléments convenus ensemble. Vous pourrez activer votre abonnement dès validation de votre projet.</p></section>;
}

function SubscriptionCard() {
  return <section className="client-card prospect-subscription" aria-labelledby="subscription-title"><div className="prospect-subscription-heading"><div><p className="client-eyebrow">ABONNEMENT</p><h2 id="subscription-title">Activez votre abonnement pour lancer la création</h2><p className="prospect-subscription-intro">Votre site sera créé à partir de la configuration que vous venez de valider.</p></div><div className="prospect-price"><strong>49 €</strong><span>/mois</span></div></div><p className="client-free-creation">0 € de frais de création</p><ul className="client-included-list">{included.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul><div className="prospect-subscription-action"><StartSubscriptionButton label="Activer mon abonnement — 49 €/mois" /><p>Votre abonnement est mensuel. La création de votre site démarre après confirmation du paiement.</p></div></section>;
}

export function ProspectProjectDashboard({ project, checkout, review: initialReview = { appointment: null, validation: { status: "pending" } } }: { project: OnboardingProject; checkout?: string; review?: ProjectReview }) {
  const [message, setMessage] = useState(""); const [sent, setSent] = useState(false); const [loading, setLoading] = useState(false); const [review, setReview] = useState(initialReview); const complete = isOnboardingComplete(project); const completed = completedOnboardingSteps(project); const resumeLabel = completed === 0 ? "Commencer la configuration" : "Continuer la configuration";
  useEffect(() => { if (!complete) return; let active = true; void fetch("/api/prospect/appointment").then(async (response) => { if (!response.ok) return; const body = await response.json(); if (active && body?.validation?.status) setReview({ appointment: body.appointment ?? null, validation: { status: body.validation.status }, approvalEventId: body.approvalEventId }); }).catch(() => undefined); return () => { active = false; }; }, [complete]);
  async function ask() { setLoading(true); const response = await fetch("/api/onboarding/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) }); setLoading(false); if (response.ok) { setSent(true); setMessage(""); } }
  return <main className="client-space prospect-space">{review.validation.status === "approved" && review.approvalEventId && <TrackingEvent name="prospect_approved" eventId={review.approvalEventId} />}<header className="client-header"><div><p className="client-eyebrow">VOTRE ESPACE FEASEWEB</p><h1>{complete ? "Votre projet est configuré" : `Bonjour${project.firstName ? ` ${project.firstName}` : ""}.`}</h1><p>{complete ? "Nous avons toutes les informations nécessaires pour préparer votre site." : "Configurez votre projet pour que FeaseWeb puisse préparer la suite avec vous."}</p></div></header>{checkout === "success" && <div className="client-alert" role="status">Votre demande d'abonnement a bien été reçue. Le statut se met à jour après confirmation de Stripe.</div>}{checkout === "cancelled" && <div className="client-alert muted" role="status">Le paiement a été annulé. Votre configuration est conservée.</div>}{!complete && <section className="client-card client-project-progress"><p className="client-eyebrow">CONFIGURATION EN COURS</p><h2>{completed} étape{completed > 1 ? "s" : ""} sur 8 terminée{completed > 1 ? "s" : "e"}</h2><p className="mt-2 text-ink-soft">Vos réponses sont sauvegardées au fil du parcours.</p><a href="/creer-mon-site" className="mt-5 inline-flex rounded-sm bg-brand px-5 py-3 font-medium text-white">{resumeLabel}</a></section>}{complete && <><section className="prospect-confirmation" aria-label="Configuration terminée"><span className="prospect-confirmation-mark" aria-hidden="true">✓</span><div><p className="client-eyebrow">CONFIGURATION ENREGISTRÉE</p><h2>Votre projet est configuré</h2><p>Nous avons toutes les informations nécessaires pour préparer votre site.</p></div></section><Timeline status={project.projectStatus} complete review={review} /><ProjectSummary project={project} /><AppointmentCard project={project} review={review} onChange={(appointment) => setReview((current) => ({ ...current, appointment }))} />{review.appointment?.status === "completed" && <ValidationCard review={review} />}{review.validation.status === "approved" && <SubscriptionCard />}</>}<section className="client-card client-support prospect-support"><h2>Une question avant de démarrer ?</h2><p>Écrivez-nous depuis votre espace, sans quitter votre projet.</p><textarea aria-label="Question à FeaseWeb" value={message} onChange={(e) => setMessage(e.target.value)} className="mt-4 w-full rounded-sm border border-line p-3" rows={4} placeholder="Votre question" /><button type="button" disabled={!message.trim() || loading} onClick={() => void ask()} className="mt-3 rounded-sm border border-brand px-4 py-2 text-sm font-medium text-brand disabled:opacity-50">{loading ? "Envoi…" : "J'ai une question avant de démarrer"}</button>{sent && <p className="mt-2 text-sm text-brand" role="status">Votre demande a bien été transmise à FeaseWeb.</p>}</section></main>;
}
