"use client";

import { useEffect, useRef, useState } from "react";
import type { ClientUpdateActionType, ClientUpdateType } from "@/lib/backoffice";

type UpdateRecord = { id: string; updateType?: ClientUpdateType; actionType?: ClientUpdateActionType; title: string; description: string; status: string; activityDate: string; createdAt: string; readAt?: string | null };
const typeLabels: Record<string, string> = { information: "Information", avancement: "Avancement", action_requise: "Action requise", apercu_disponible: "Aperçu disponible", mise_en_ligne: "Mise en ligne" };
const actionLabels: Record<string, string> = { voir_apercu: "Voir mon aperçu", completer_informations: "Compléter mes informations", voir_projet: "Voir mon projet" };
const date = (value: string) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));

function actionHref(action?: ClientUpdateActionType) {
  if (action === "completer_informations") return "/espace-client/production";
  if (action === "voir_projet") return "#mon-site";
  return "#mon-site";
}

export function ClientUpdatesSection({ updates }: { updates: UpdateRecord[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [marked, setMarked] = useState(false);
  const unreadCount = updates.filter((update) => !update.readAt).length;
  useEffect(() => {
    if (!unreadCount || marked || !sectionRef.current) return;
    const section = sectionRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
      setMarked(true);
      void fetch("/api/client/updates/read", { method: "POST" }).catch(() => undefined);
      observer.disconnect();
    }, { threshold: [0.5] });
    observer.observe(section);
    return () => observer.disconnect();
  }, [marked, unreadCount]);
  return <section ref={sectionRef} id="suivi-site" className="client-card client-activity-card client-dashboard-activity" aria-labelledby="client-updates-title"><div className="client-section-heading"><p className="client-eyebrow">SUIVI DE VOTRE SITE</p><div className="client-updates-heading"><h2 id="client-updates-title">Mises à jour client</h2>{unreadCount > 0 && <span className="client-unread-badge">{unreadCount} nouvelle{unreadCount > 1 ? "s" : ""} mise{unreadCount > 1 ? "s" : ""} à jour</span>}</div><p>Les informations publiées par FeaseWeb pour votre projet apparaîtront ici.</p></div>{updates.length ? <div className="client-update-list">{updates.map((update) => <article className="client-update" key={update.id}><div className="client-update-date">{date(update.activityDate)}</div><div className="client-update-mark" aria-hidden="true" /><div><p className="client-update-category">{typeLabels[update.updateType ?? "information"] ?? "Information"}</p><h3>{update.title}</h3><p>{update.description}</p>{update.actionType && <a className="client-text-link" href={actionHref(update.actionType)}>{actionLabels[update.actionType]} →</a>}</div></article>)}</div> : <div className="client-empty compact"><p>Aucune mise à jour publiée pour le moment.</p></div>}</section>;
}
