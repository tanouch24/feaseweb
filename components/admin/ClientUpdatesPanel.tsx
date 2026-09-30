"use client";

import { FormEvent, useState } from "react";
import type { ClientUpdate, ClientUpdateActionType, ClientUpdateType } from "@/lib/backoffice";
import { formatDate, labelMap } from "@/lib/backoffice";
import { useBackoffice } from "@/lib/backoffice-store";
function PanelTitle({ title }: { title: string }) { return <div className="admin-panel-title"><h2>{title}</h2></div>; }
function StatusBadge({ value }: { value: string }) { return <span className="admin-badge neutral"><span />{labelMap[value] ?? value}</span>; }
function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="admin-empty"><div className="admin-empty-mark">—</div><h3>{title}</h3><p>{detail}</p></div>; }

const updateTypes: ClientUpdateType[] = ["information", "avancement", "action_requise", "apercu_disponible", "mise_en_ligne"];
const actionTypes: Array<{ value: ClientUpdateActionType; label: string }> = [{ value: "voir_apercu", label: "Voir mon aperçu" }, { value: "completer_informations", label: "Compléter mes informations" }, { value: "voir_projet", label: "Voir mon projet" }];
type UpdateForm = { updateType: ClientUpdateType; actionType: ClientUpdateActionType | ""; title: string; message: string };
const emptyForm = (): UpdateForm => ({ updateType: "information", actionType: "", title: "", message: "" });

export function ClientUpdatesPanel({ clientId, projectIntakeId, siteId }: { clientId?: string; projectIntakeId?: string; siteId?: string }) {
  const { data, createClientUpdate, updateClientUpdate, deleteClientUpdate } = useBackoffice();
  const updates = data.clientUpdates.filter((update) => (projectIntakeId && update.projectIntakeId === projectIntakeId) || (clientId && update.clientId === clientId));
  const [editing, setEditing] = useState<ClientUpdate | null>(null);
  const [form, setForm] = useState<UpdateForm>(emptyForm());
  const [notice, setNotice] = useState("");
  const reset = () => { setEditing(null); setForm(emptyForm()); };
  const edit = (update: ClientUpdate) => { setEditing(update); setForm({ updateType: update.updateType, actionType: update.actionType ?? "", title: update.title, message: update.description }); };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    setNotice("");
    const payload = { updateType: form.updateType, actionType: form.actionType || null, title: form.title, message: form.message };
    try {
      if (editing) await updateClientUpdate(editing.id, payload);
      else {
        const result = await createClientUpdate({ ...payload, actionType: form.actionType || undefined, clientId, projectIntakeId, siteId });
        setNotice(result.warning ?? "Mise à jour publiée et email envoyé.");
      }
      reset();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Impossible de publier la mise à jour.");
    }
  };
  return <section className="admin-panel admin-panel-wide">
    <PanelTitle title="Activité FeaseWeb" />
    <p className="admin-panel-intro">Publiez un point de suivi visible par ce client. Les mises à jour restent séparées du statut de production.</p>
    <form className="admin-form admin-update-form" onSubmit={submit}>
      <div className="admin-update-form-grid"><label>Type<select value={form.updateType} onChange={(event) => setForm({ ...form, updateType: event.target.value as ClientUpdateType })}>{updateTypes.map((type) => <option key={type} value={type}>{labelMap[type]}</option>)}</select></label><label>Lien / action<select value={form.actionType} onChange={(event) => setForm({ ...form, actionType: event.target.value as UpdateForm["actionType"] })}><option value="">Aucune action</option>{actionTypes.map((action) => <option key={action.value} value={action.value}>{action.label}</option>)}</select></label></div>
      <label>Titre<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={180} required placeholder="Votre première version est prête" /></label>
      <label>Message<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} maxLength={5000} required placeholder="Expliquez clairement l'avancement du projet…" /></label>
      <div className="admin-update-actions"><button className="admin-button" type="submit">{editing ? "Enregistrer la modification" : "Publier la mise à jour"}</button>{editing && <button className="admin-button secondary" type="button" onClick={reset}>Annuler</button>}</div>
      {notice && <p className="admin-panel-intro" role="status">{notice}</p>}
    </form>
    <div className="admin-update-list">{updates.length ? updates.map((update) => <article className="admin-update-row" key={update.id}><div className="admin-update-copy"><div className="admin-update-meta"><StatusBadge value={update.updateType} /><StatusBadge value={update.readAt ? "Lu" : "Non lu"} /><span>{update.visibleToClient ? "Publié" : "Interne"} · {formatDate(update.activityDate)}</span></div><strong>{update.title}</strong><p>{update.description}</p>{update.actionType && <small>{labelMap[update.actionType]}</small>}</div><div className="admin-update-row-actions"><button className="admin-text-button" type="button" onClick={() => edit(update)}>Modifier</button><button className="admin-text-button admin-danger-button" type="button" onClick={() => { if (window.confirm("Supprimer cette mise à jour ?")) void deleteClientUpdate(update.id); }}>Supprimer</button></div></article>) : <EmptyState title="Aucune mise à jour" detail="Le suivi publié par FeaseWeb apparaîtra ici après la première publication." />}</div>
  </section>;
}
