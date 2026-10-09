"use client";

import { FormEvent, useState } from "react";
import { useBackoffice } from "@/lib/backoffice-store";
import { formatDate, getClientName, type RequestStatus } from "@/lib/backoffice";
import { getProjectStatusLabel } from "@/lib/admin-presentation";
import { canRequestPayment } from "@/lib/admin-payment-request";
import { PageHeading } from "@/components/admin/AdminApp";
import { ClientUpdatesPanel } from "@/components/admin/ClientUpdatesPanel";
import Link from "next/link";

function requestLabel(status: RequestStatus) {
  return status === "terminee" ? "Terminée" : status === "en_cours" ? "En cours" : "À faire";
}

export function DossierDetail({ dossierId }: { dossierId: string }) {
  const { data, scheduleProspectAppointment, updateProspectReview, setRequestStatus, addClientNote, addProspectNote, createClientUpdate, setSiteStatus, saveSiteForProject } = useBackoffice();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [clientMessage, setClientMessage] = useState("");
  const [siteDomain, setSiteDomainValue] = useState("");
  const [workDate, setWorkDate] = useState(new Date().toISOString().slice(0, 10));
  const [workAction, setWorkAction] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [inviting, setInviting] = useState(false);
  const prospect = data.prospects.find((item) => item.id === dossierId);
  const client = data.clients.find((item) => item.id === dossierId || (prospect && item.prospectId === prospect.id));
  if (!prospect && !client) return <><PageHeading eyebrow="Dossier" title="Dossier introuvable" /><Link href="/admin/dossiers" className="admin-button secondary">Retour aux dossiers</Link></>;
  const project = data.projectIntakes.find((item) => (prospect && item.prospectId === prospect.id) || (client && item.clientId === client.id));
  const appointment = prospect?.review ?? (project ? { appointmentStatus: project.appointmentStatus ?? "not_scheduled", appointmentDate: project.appointmentDate, appointmentTime: project.appointmentTime } : undefined);
  const payment = data.payments.filter((item) => item.clientId === client?.id && item.provider === "stripe").sort((a, b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? ""))[0];
  const paymentConfirmed = payment?.status === "paye";
  const paymentRequested = (prospect?.review?.validationStatus ?? project?.validationStatus) === "approved";
  const canAskForPayment = Boolean((prospect || client) && canRequestPayment({ validationStatus: prospect?.review?.validationStatus ?? project?.validationStatus, prospectStatus: prospect?.status, paymentConfirmed }));
  const requests = data.requests.filter((item) => (project && item.projectIntakeId === project.id) || (client && item.clientId === client.id));
  const site = project ? data.sites.find((item) => item.projectIntakeId === project.id || (client && (item.id === client.siteId || item.clientId === client.id))) : undefined;
  const siteCompleted = Boolean(site?.status === "actif" && site.finalDomain.trim());
  const activeRequests = requests.filter((item) => !["terminee", "hors_perimetre"].includes(item.status));
  const configuration = !project || (project.currentStep < 8 && !project.completedAt) ? "À compléter" : project.status === "project_configured" ? "Reçue / Complète" : getProjectStatusLabel(project.status);
  const person = prospect ? `${prospect.firstName} ${prospect.lastName}`.trim() : getClientName(client);
  const company = prospect?.company ?? client?.company ?? "Dossier";
  // Contact venu de /refaire-mon-site ou /contact : pas encore d'espace ni de
  // configuration, donc ni rendez-vous ni paiement possibles. On l'invite.
  const leadOnly = Boolean(prospect && !project && !client);

  async function run(action: "complete_appointment" | "approve") {
    setError("");
    try { await updateProspectReview(dossierId, action); setMessage(action === "approve" ? "Paiement demandé." : "Rendez-vous marqué comme effectué."); } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible d'enregistrer l'action."); }
  }
  async function invite() {
    if (!prospect) return;
    setError(""); setInviting(true);
    try {
      const response = await fetch(`/api/admin/prospects/${prospect.id}/invite`, { method: "POST" });
      const body = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(body?.error ?? "Impossible d'envoyer l'invitation.");
      setMessage(`Invitation envoyée à ${prospect.email}.`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible d'envoyer l'invitation."); }
    finally { setInviting(false); }
  }
  async function schedule(event: FormEvent) {
    event.preventDefault(); setError("");
    try { await scheduleProspectAppointment(dossierId, date, time); setDate(""); setTime(""); setMessage("Rendez-vous planifié."); } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible de planifier le rendez-vous."); }
  }
  async function saveNote(event: FormEvent) {
    event.preventDefault(); if (!note.trim()) return; setError("");
    try { if (client) await addClientNote(client.id, note.trim()); else await addProspectNote(prospect!.id, note.trim()); setNote(""); setMessage("Note interne enregistrée."); } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible d'enregistrer la note."); }
  }
  async function askClient(event: FormEvent) {
    event.preventDefault(); if (!project || !clientMessage.trim()) return; setError("");
    try { const result = await createClientUpdate({ clientId: client?.id, projectIntakeId: project.id, siteId: site?.id, updateType: "action_requise", actionType: "completer_informations", title: "FeaseWeb a besoin d'une information", message: clientMessage.trim() }); setClientMessage(""); setMessage(result.warning ? result.warning : "Demande envoyée au client."); } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible d'envoyer la demande."); }
  }
  async function addWork(event: FormEvent) { event.preventDefault(); if (!project || !workAction.trim()) return; setError(""); try { await createClientUpdate({ clientId: client?.id, projectIntakeId: project.id, siteId: site?.id, updateType: "avancement", title: workAction.trim(), message: workDescription.trim() || workAction.trim(), activityDate: workDate }); setWorkAction(""); setWorkDescription(""); setMessage("Action publiée dans le suivi du client."); } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible de publier l'action."); } }
  async function saveSiteDomain(event: FormEvent) { event.preventDefault(); if (!project || !siteDomain.trim()) return; setError(""); try { await saveSiteForProject(project.id, siteDomain.trim()); setSiteDomainValue(""); setMessage("Domaine enregistré."); } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible d'enregistrer le domaine."); } }
  return <>
    <PageHeading eyebrow="Dossier" title={company} description={`${person} · ${prospect?.phone ?? client?.phone ?? "Téléphone non renseigné"} · ${prospect?.email ?? client?.email ?? "Email non renseigné"}`} action={<Link href="/admin/dossiers" className="admin-button secondary">← Dossiers</Link>} />
    <div className="admin-dossier-detail">
      {leadOnly ? <section className="admin-panel admin-dossier-payment"><p className="admin-kicker">ESPACE CLIENT</p><h2>Pas encore d&apos;espace FeaseWeb</h2><p>{prospect?.currentSite ? `Demande de refonte pour ${prospect.currentSite}. ` : ""}Ce contact doit créer son espace pour configurer son projet, choisir un rendez-vous puis payer.</p><button className="admin-button admin-payment-primary" disabled={inviting} onClick={() => void invite()}>{inviting ? "Envoi…" : "Inviter à créer son espace"}</button></section> : <section className="admin-panel admin-dossier-payment"><p className="admin-kicker">PAIEMENT</p><h2>{paymentConfirmed ? "Paiement effectué" : paymentRequested ? "Demande de paiement envoyée" : "Demande de paiement à envoyer"}</h2>{paymentConfirmed ? <p>49 €/mois{payment?.paidAt ? ` · premier paiement le ${formatDate(payment.paidAt)}` : ""}</p> : paymentRequested ? <p>En attente du règlement du client.</p> : canAskForPayment ? <button className="admin-button admin-payment-primary" onClick={() => void run("approve")}>Demander le paiement</button> : <p>Le paiement n&apos;est pas disponible pour ce dossier.</p>}</section>}
      <section className="admin-panel"><p className="admin-kicker">À FAIRE</p><div className="admin-dossier-task"><div><strong>Rendez-vous</strong>{appointment?.appointmentStatus === "scheduled" && <p>{appointment.appointmentDate ?? "Date à préciser"}{appointment.appointmentTime ? ` à ${appointment.appointmentTime}` : ""}</p>}{appointment?.appointmentStatus === "completed" && <p>Effectué ✓</p>}{(!appointment || appointment.appointmentStatus === "not_scheduled" || appointment.appointmentStatus === "cancelled") && <p>{leadOnly ? "Possible une fois l'espace créé" : "À planifier"}</p>}</div>{appointment?.appointmentStatus === "scheduled" && <button className="admin-button" onClick={() => void run("complete_appointment")}>Marquer effectué</button>}{(!appointment || appointment.appointmentStatus === "not_scheduled" || appointment.appointmentStatus === "cancelled") && (prospect || client) && !leadOnly && <form className="admin-appointment-form" onSubmit={(event) => void schedule(event)}><label>Date<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>Heure<input required type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><button className="admin-button" type="submit">Planifier</button></form>}</div><div className="admin-dossier-task"><div><strong>Configuration du site</strong><p>{configuration}</p></div>{project && configuration === "À compléter" && <Link href={prospect ? `/admin/prospects/${prospect.id}` : `/admin/clients/${client?.id}`} className="admin-button secondary">Voir les informations manquantes</Link>}</div>{activeRequests.map((request) => <div className="admin-dossier-task" key={request.id}><div><strong>MESSAGE DU CLIENT</strong><p>{formatDate(request.createdAt)} · {requestLabel(request.status)}{request.source === "project_message" && !request.readAt ? " · NOUVEAU" : ""}</p><p>{request.message}</p></div>{request.source === "modification_request" && <div className="admin-detail-actions"><button className="admin-button secondary" disabled={request.status === "en_cours"} onClick={() => void setRequestStatus(request.id, "en_cours")}>Passer en cours</button><button className="admin-button" disabled={request.status === "terminee"} onClick={() => void setRequestStatus(request.id, "terminee")}>Terminer</button></div>}</div>)}{requests.filter((request) => request.status === "terminee").length > 0 && <details className="admin-dossier-history"><summary>Historique des demandes terminées</summary>{requests.filter((request) => request.status === "terminee").map((request) => <p key={request.id}>{request.title} · Terminée</p>)}</details>}</section>
      <section className="admin-panel"><p className="admin-kicker">MON SITE</p>{site ? <><div className="admin-dossier-task"><div><strong>{siteCompleted ? "Site terminé" : "Site en cours de création"}</strong><p>{site.finalDomain ? (siteCompleted ? "Le site peut être présenté au client." : "Le domaine est enregistré, le site reste en construction.") : "Aucun domaine renseigné pour le moment."}</p></div>{!siteCompleted && site.finalDomain.trim() && <button className="admin-button" onClick={() => void setSiteStatus(site.id, "actif")}>Marquer le site comme terminé</button>}</div><form className="admin-preview-form" onSubmit={(event) => void saveSiteDomain(event)}><label>URL / domaine<input aria-label="URL ou domaine du site" type="text" placeholder="https://monsite.fr" value={siteDomain} onChange={(event) => setSiteDomainValue(event.target.value)} /></label><button className="admin-button" type="submit">Enregistrer</button></form></> : <form className="admin-preview-form" onSubmit={(event) => void saveSiteDomain(event)}><p>Aucun suivi de site n&apos;existe encore pour ce dossier.</p><label>URL / domaine<input aria-label="URL ou domaine du site" type="text" placeholder="https://monsite.fr" value={siteDomain} onChange={(event) => setSiteDomainValue(event.target.value)} /></label><button className="admin-button" type="submit">Créer le suivi et enregistrer</button></form>}</section>
      {project && <section className="admin-panel"><p className="admin-kicker">SEO &amp; SUIVI</p><ClientUpdatesPanel clientId={client?.id} projectIntakeId={project.id} siteId={site?.id} /></section>}
      {project && <section className="admin-panel"><p className="admin-kicker">TRAVAIL RÉALISÉ</p><p className="admin-panel-intro">Publiez ici les actions générales réalisées par FeaseWeb. Les actions spécifiquement SEO restent dans le journal SEO.</p><form className="admin-note-form" onSubmit={(event) => void addWork(event)}><label>Date<input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} required /></label><textarea aria-label="Action réalisée" placeholder="Page d'accueil créée" value={workAction} onChange={(event) => setWorkAction(event.target.value)} required /><textarea aria-label="Description de l'action" placeholder="Détail facultatif" value={workDescription} onChange={(event) => setWorkDescription(event.target.value)} /><button className="admin-button" type="submit">Publier</button></form></section>}
      <section className="admin-panel"><p className="admin-kicker">NOTE INTERNE</p><form className="admin-note-form" onSubmit={(event) => void saveNote(event)}><textarea aria-label="Note interne" placeholder="Note visible uniquement par FeaseWeb…" value={note} onChange={(event) => setNote(event.target.value)} /><button className="admin-button" type="submit">Enregistrer la note</button></form>{(client?.notes ?? prospect?.notes ?? []).map((item, index) => <p className="admin-note" key={`${item}-${index}`}>{item}</p>)}</section>
      {project && <section className="admin-panel"><p className="admin-kicker">DEMANDER AU CLIENT</p><h2>Demander une information au client</h2><form className="admin-note-form" onSubmit={(event) => void askClient(event)}><textarea aria-label="Demande au client" placeholder="Que souhaitez-vous demander au client ?" value={clientMessage} onChange={(event) => setClientMessage(event.target.value)} /><button className="admin-button" type="submit">Envoyer la demande</button></form></section>}
      {(message || error) && <p className={error ? "admin-form-error" : "admin-form-message"} role="status">{error || message}</p>}
    </div>
  </>;
}
