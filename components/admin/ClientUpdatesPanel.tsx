"use client";

import { FormEvent, useState } from "react";
import type { ClientUpdate, ClientUpdateCategory, ClientUpdateStatus } from "@/lib/backoffice";
import { formatDate, labelMap } from "@/lib/backoffice";
import { useBackoffice } from "@/lib/backoffice-store";
function PanelTitle({ title }: { title: string }) { return <div className="admin-panel-title"><h2>{title}</h2></div>; }
function StatusBadge({ value }: { value: string }) { return <span className="admin-badge neutral"><span />{labelMap[value] ?? value}</span>; }
function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="admin-empty"><div className="admin-empty-mark">—</div><h3>{title}</h3><p>{detail}</p></div>; }

const categories: ClientUpdateCategory[] = ["seo", "contenu", "maintenance", "site", "securite", "autre"];
const statuses: ClientUpdateStatus[] = ["prevu", "en_cours", "termine"];
const today = () => new Date().toISOString().slice(0, 10);

export function ClientUpdatesPanel({ clientId, siteId }: { clientId: string; siteId?: string }) {
  const { data, createClientUpdate, updateClientUpdate, deleteClientUpdate } = useBackoffice();
  const updates = data.clientUpdates.filter((update) => update.clientId === clientId);
  const [editing, setEditing] = useState<ClientUpdate | null>(null);
  const [form, setForm] = useState({ category: "maintenance" as ClientUpdateCategory, title: "", description: "", status: "termine" as ClientUpdateStatus, visibleToClient: true, activityDate: today() });
  const reset = () => { setEditing(null); setForm({ category: "maintenance", title: "", description: "", status: "termine", visibleToClient: true, activityDate: today() }); };
  const edit = (update: ClientUpdate) => { setEditing(update); setForm({ category: update.category, title: update.title, description: update.description, status: update.status, visibleToClient: update.visibleToClient, activityDate: update.activityDate }); };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    if (editing) await updateClientUpdate(editing.id, form);
    else await createClientUpdate({ ...form, clientId, siteId });
    reset();
  };
  return <section className="admin-panel admin-panel-wide">
    <PanelTitle title="Activité FeaseWeb" />
    <p className="admin-panel-intro">Saisissez uniquement les interventions réellement réalisées ou planifiées. Une mise à jour interne reste invisible au client.</p>
    <form className="admin-form admin-update-form" onSubmit={submit}>
      <div className="admin-update-form-grid"><label>Catégorie<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ClientUpdateCategory })}>{categories.map((category) => <option key={category} value={category}>{labelMap[category]}</option>)}</select></label><label>Date<input type="date" value={form.activityDate} onChange={(event) => setForm({ ...form, activityDate: event.target.value })} required /></label><label>Statut<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ClientUpdateStatus })}>{statuses.map((status) => <option key={status} value={status}>{labelMap[status]}</option>)}</select></label></div>
      <label>Titre<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={180} required placeholder="Optimisation du référencement local" /></label>
      <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={5000} required placeholder="Décrivez précisément ce qui a été fait ou prévu…" /></label>
      <label className="admin-checkbox"><input type="checkbox" checked={form.visibleToClient} onChange={(event) => setForm({ ...form, visibleToClient: event.target.checked })} /> Visible par le client</label>
      <div className="admin-update-actions"><button className="admin-button" type="submit">{editing ? "Enregistrer la modification" : "+ Ajouter une mise à jour"}</button>{editing && <button className="admin-button secondary" type="button" onClick={reset}>Annuler</button>}</div>
    </form>
    <div className="admin-update-list">{updates.length ? updates.map((update) => <article className="admin-update-row" key={update.id}><div className="admin-update-copy"><div className="admin-update-meta"><StatusBadge value={update.category} /><StatusBadge value={update.status} /><span>{update.visibleToClient ? "Visible client" : "Interne"} · {formatDate(update.activityDate)}</span></div><strong>{update.title}</strong><p>{update.description}</p></div><div className="admin-update-row-actions"><button className="admin-text-button" type="button" onClick={() => edit(update)}>Modifier</button><button className="admin-text-button admin-danger-button" type="button" onClick={() => { if (window.confirm("Supprimer cette mise à jour ?")) void deleteClientUpdate(update.id); }}>Supprimer</button></div></article>) : <EmptyState title="Aucune mise à jour" detail="Le suivi visible par le client apparaîtra ici après la première intervention saisie." />}</div>
  </section>;
}
