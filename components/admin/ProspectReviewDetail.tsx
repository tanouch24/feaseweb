"use client";
/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { useState } from "react";
import { formatDate } from "@/lib/backoffice";
import { getProspectBusinessState } from "@/lib/admin-presentation";
import { useBackoffice } from "@/lib/backoffice-store";
import { EmptyState, PageHeading, PanelTitle, StatusBadge } from "@/components/admin/AdminApp";
import { canRequestPayment } from "@/lib/admin-payment-request";

export function ProspectReviewDetail({ prospectId }: { prospectId: string }) {
  const { data, updateProspectReview } = useBackoffice();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const prospect = data.prospects.find((item) => item.id === prospectId);
  if (!prospect) return <><PageHeading eyebrow="Acquisition" title="Prospect introuvable" /><Link href="/admin/prospects" className="admin-button secondary">Retour aux prospects</Link></>;
  const project = data.projectIntakes.find((item) => item.prospectId === prospect.id);
  const selectedProspectId = prospect.id;
  const review = prospect.review;
  const linkedClient = data.clients.find((client) => client.prospectId === prospect.id);
  const paymentConfirmed = Boolean(linkedClient && data.payments.some((payment) => payment.clientId === linkedClient.id && payment.provider === "stripe" && payment.status === "paye"));
  const canAskForPayment = canRequestPayment({ appointmentStatus: review?.appointmentStatus, validationStatus: review?.validationStatus, prospectStatus: prospect.status, paymentConfirmed });
  const businessState = getProspectBusinessState(prospect, project);
  async function run(action: "complete_appointment" | "cancel_appointment" | "approve" | "needs_information" | "decline") {
    if (action === "decline" && !window.confirm("Confirmer le refus de ce projet ? Aucune donnée ne sera supprimée.")) return;
    setError("");
    try { await updateProspectReview(selectedProspectId, action, note.trim() || undefined); setNote(""); } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible d'enregistrer cette action."); }
  }
  return <>
    <PageHeading eyebrow="Dossier prospect" title={prospect.company} description={`${prospect.firstName} ${prospect.lastName} · ${prospect.email} · ${prospect.phone}`} action={<Link href="/admin/prospects" className="admin-button secondary">← Prospects</Link>} />
    <div className="admin-detail-grid">
      <section className="admin-panel">
        <PanelTitle title="État du dossier" />
        <div className="admin-detail-action"><span>État actuel</span><strong>{businessState.label}</strong></div>
        <div className="admin-detail-action"><span>Prochaine action</span><strong>{businessState.nextAction}</strong></div>
        <dl className="admin-detail-rows"><div><dt>Contact</dt><dd>{prospect.firstName} {prospect.lastName}</dd></div><div><dt>Activité</dt><dd>{prospect.activity || "—"}</dd></div><div><dt>Ville</dt><dd>{prospect.city || "—"}</dd></div><div><dt>Téléphone</dt><dd>{prospect.phone || "—"}</dd></div><div><dt>Reçu le</dt><dd>{formatDate(prospect.createdAt)}</dd></div></dl>
      </section>
      {project && <section className="admin-panel"><PanelTitle title="Projet configuré" /><dl className="admin-detail-rows"><div><dt>Objectif</dt><dd>{project.objective || "—"}</dd></div><div><dt>Pages</dt><dd>{project.pages.join(", ") || "—"}</dd></div><div><dt>Design</dt><dd>{project.style || "—"} · {project.palette || "—"}</dd></div><div><dt>Configuration</dt><dd>{project.currentStep >= 8 || project.completedAt ? "Informations reçues" : `En cours · étape ${project.currentStep}/8`}</dd></div></dl></section>}
      <section className="admin-panel admin-panel-wide">
        <PanelTitle title="Rendez-vous & décision FeaseWeb" />
        <div className="admin-detail-action"><span>Rendez-vous</span><StatusBadge value={review?.appointmentStatus ?? "not_scheduled"} />{review?.appointmentDate && <span>{review.appointmentDate} {review.appointmentTime ?? ""}</span>}</div>
        <div className="admin-detail-action"><span>Décision</span><StatusBadge value={review?.validationStatus ?? "pending"} /></div>
        <div className="admin-detail-actions">
          {review?.appointmentStatus === "scheduled" && <><button className="admin-button" onClick={() => void run("complete_appointment")}>Marquer le rendez-vous effectué</button><button className="admin-button secondary" onClick={() => void run("cancel_appointment")}>Annuler le rendez-vous</button></>}
          {canAskForPayment && <button className="admin-button" onClick={() => void run("approve")}>Demander le paiement</button>}
          {review?.appointmentStatus === "completed" && review.validationStatus !== "approved" && <><button className="admin-button secondary" onClick={() => void run("needs_information")}>Demander des informations</button><button className="admin-button secondary" onClick={() => void run("decline")}>Refuser le projet</button></>}
        </div>
        {review?.validationStatus === "approved" && <p className="admin-panel-intro"><strong>Paiement demandé.</strong> Le bouton de paiement est disponible dans l'espace client. Stripe confirmera ensuite le paiement.</p>}
        <textarea aria-label="Note interne de validation" className="mt-4 w-full rounded-sm border border-line p-3" rows={3} placeholder="Note interne facultative, invisible au prospect" value={note} onChange={(event) => setNote(event.target.value)} />
        {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
      </section>
      {!project && <section className="admin-panel"><EmptyState title="Configuration incomplète" detail="Le questionnaire commercial n'est pas encore associé à ce prospect." /></section>}
    </div>
  </>;
}
