"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from "react";
import { StartSubscriptionButton } from "@/components/billing/BillingActions";
import { completedOnboardingSteps, isOnboardingComplete, onboardingLabels, type OnboardingProject, type ProjectTimelineStage } from "@/lib/onboarding";
import type { ProjectAppointment, ProjectReview } from "@/lib/project-review";
import { trackEvent } from "@/lib/analytics";
import { TrackingEvent } from "@/components/analytics/TrackingEvent";
import { clientOrderTimeline } from "@/lib/client-order-timeline";
import { LogoutButton } from "@/components/layout/LogoutButton";

function Timeline({ complete, review }: { complete: boolean; review: ProjectReview }) {
  const stages = clientOrderTimeline({ hasProject: complete, appointmentStatus: review.appointment?.status, appointmentDate: review.appointment?.date, appointmentTime: review.appointment?.time, paymentConfirmed: false, live: false });
  return <section className="client-card prospect-timeline" aria-labelledby="project-timeline-title">
    <div className="client-card-heading"><div><p className="client-eyebrow">VOTRE PARCOURS</p><h2 id="project-timeline-title">Les étapes de votre projet</h2></div></div>
    <ol className="project-timeline-list">{stages.map((stage, index) => <TimelineItem key={stage.key} stage={stage} index={index} />)}</ol>
  </section>;
}

function TimelineItem({ stage, index }: { stage: ProjectTimelineStage; index: number }) {
  const stateLabel = stage.state === "complete" ? "Terminée" : stage.state === "current" ? "Étape actuelle" : "À venir";
  return <li className={`project-timeline-item ${stage.state}`}><span className="project-timeline-marker" aria-hidden="true">{stage.state === "complete" ? "✓" : index + 1}</span><span className="project-timeline-copy"><strong>{stage.label}</strong><small>{stateLabel}</small></span></li>;
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
  return <section className="client-card prospect-validation" aria-labelledby="validation-title"><p className="client-eyebrow">SUIVI DE VOTRE PROJET</p><h2 id="validation-title">Votre projet est en cours de préparation</h2><p>Votre projet est en cours de préparation par FeaseWeb. Aucun paiement n'est demandé pour le moment.</p></section>;
}

function SubscriptionCard() {
  return <section className="client-card prospect-subscription" aria-labelledby="subscription-title"><p className="client-eyebrow">VOTRE PROJET EST PRÊT</p><h2 id="subscription-title">Votre projet est prêt à démarrer.</h2><p className="prospect-price"><strong>49 €</strong><span>/mois</span></p><StartSubscriptionButton label="Payer mon abonnement" /><p>Création ou refonte du site, hébergement, maintenance et suivi.</p></section>;
}

export function ProspectProjectDashboard({ project, checkout, review: initialReview = { appointment: null, validation: { status: "pending" } } }: { project: OnboardingProject; checkout?: string; review?: ProjectReview }) {
  const [review, setReview] = useState(initialReview); const complete = isOnboardingComplete(project); const completed = completedOnboardingSteps(project); const resumeLabel = completed === 0 ? "Commencer la configuration" : "Continuer la configuration";
  useEffect(() => { if (!complete) return; let active = true; void fetch("/api/prospect/appointment").then(async (response) => { if (!response.ok) return; const body = await response.json(); if (active && body?.validation?.status) setReview({ appointment: body.appointment ?? null, validation: { status: body.validation.status }, approvalEventId: body.approvalEventId }); }).catch(() => undefined); return () => { active = false; }; }, [complete]);
  return <main className="client-space prospect-space"><header className="client-header"><div><p className="client-eyebrow">ESPACE CLIENT FEASEWEB</p><h1>Mon site FeaseWeb</h1><p>Bonjour{project.firstName ? ` ${project.firstName}` : ""}. Voici le suivi de votre projet.</p></div><LogoutButton /></header>{review.validation.status === "approved" && review.approvalEventId && <TrackingEvent name="prospect_approved" eventId={review.approvalEventId} />}{checkout === "success" && <div className="client-alert" role="status">Votre demande d'abonnement a bien été reçue. Le statut se met à jour après confirmation de Stripe.</div>}{checkout === "cancelled" && <div className="client-alert muted" role="status">Le paiement a été annulé. Votre configuration est conservée.</div>}{!complete && <section className="client-card client-project-progress"><p className="client-eyebrow">VOTRE DEMANDE</p><h2>{completed} étape{completed > 1 ? "s" : ""} sur 8 terminée{completed > 1 ? "s" : "e"}</h2><p className="mt-2 text-ink-soft">Vos réponses sont sauvegardées au fil du parcours.</p><a href="/creer-mon-site" className="mt-5 inline-flex rounded-sm bg-brand px-5 py-3 font-medium text-white">{resumeLabel}</a></section>}{complete && <><Timeline complete review={review} /><AppointmentCard project={project} review={review} onChange={(appointment) => setReview((current) => ({ ...current, appointment }))} />{review.appointment?.status === "completed" && <ValidationCard review={review} />}{review.validation.status === "approved" && <SubscriptionCard />}</>}</main>;
}
