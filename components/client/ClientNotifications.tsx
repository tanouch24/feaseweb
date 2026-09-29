"use client";

import { useState } from "react";
import type { ClientUpdateActionType, ClientUpdateType } from "@/lib/backoffice";

type UpdateRecord = { id: string; updateType?: ClientUpdateType; actionType?: ClientUpdateActionType; title: string; description: string; readAt?: string | null };
const typeLabels: Record<string, string> = { information: "Information", avancement: "Avancement", action_requise: "Action requise", apercu_disponible: "Aperçu disponible", mise_en_ligne: "Mise en ligne" };

export function ClientNotifications({ updates }: { updates: UpdateRecord[] }) {
  const [items, setItems] = useState(updates);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const unread = items.filter((item) => !item.readAt).length;

  async function openNotification(id: string) {
    setError("");
    setOpenId(id);
    const previous = items;
    setItems((current) => current.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item));
    const response = await fetch("/api/client/updates/read", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ updateId: id }) }).catch(() => null);
    if (!response?.ok) {
      setItems(previous);
      setError("Cette notification n'a pas pu être ouverte. Réessayez.");
    }
  }

  const visible = items.filter((item) => !item.readAt || item.id === openId);
  return <section className="client-card client-notifications" aria-labelledby="client-notifications-title">
    <div className="client-section-heading"><p className="client-eyebrow">NOTIFICATIONS</p><div className="client-updates-heading"><h2 id="client-notifications-title">Notifications</h2>{unread > 0 && <span className="client-unread-badge">{unread}</span>}</div></div>
    {error && <p className="client-notification-error" role="alert">{error}</p>}
    {visible.length ? <div className="client-notification-list">{visible.map((item) => <article className={`client-notification ${item.readAt ? "read" : "unread"}`} key={item.id}><div><p className="client-update-category">{typeLabels[item.updateType ?? "information"] ?? "Information"}</p><h3>{item.title}</h3><p>{item.description}</p></div>{item.readAt ? <span className="client-notification-state">Lu</span> : <button type="button" className="client-text-link" onClick={() => void openNotification(item.id)}>Voir la demande</button>}</article>)}</div> : <p className="client-muted-note">Aucune nouvelle notification.</p>}
  </section>;
}
