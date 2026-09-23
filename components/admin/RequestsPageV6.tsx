"use client";

import { formatDate, labelMap } from "@/lib/backoffice";
import { useBackoffice } from "@/lib/backoffice-store";

export function RequestsPageV6() {
  const { data, setRequestStatus } = useBackoffice();
  return <><div className="admin-page-heading"><div><p className="admin-kicker">Opérations</p><h1>Demandes de modification</h1><p>Les demandes client sont suivies ici et leur statut est partagé avec le bon client.</p></div></div><div className="admin-table-wrap">{data.requests.length ? <table className="admin-table"><thead><tr><th>Demande</th><th>Client / site</th><th>Reçue le</th><th>Priorité</th><th>Statut</th></tr></thead><tbody>{data.requests.map((request) => { const client = data.clients.find((item) => item.id === request.clientId); const site = data.sites.find((item) => item.id === request.siteId); return <tr key={request.id}><td><strong>{request.title}</strong><small>{request.category} · {request.message}</small></td><td>{client?.company}<small>{site?.name}</small></td><td>{formatDate(request.createdAt)}</td><td>{labelMap[request.priority]}</td><td><select className="admin-inline-select" value={request.status} onChange={(event) => void setRequestStatus(request.id, event.target.value as never)} aria-label={`Statut de ${request.title}`}>{["recue", "en_cours", "besoin_information", "terminee", "hors_perimetre"].map((status) => <option key={status} value={status}>{labelMap[status]}</option>)}</select></td></tr>; })}</tbody></table> : <div className="admin-empty"><div className="admin-empty-mark">—</div><h3>Aucune demande</h3><p>Les demandes client seront regroupées ici, avec priorité et date de résolution.</p></div>}</div></>;
}
