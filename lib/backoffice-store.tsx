"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BackofficeData, ClientStatus, ModificationRequest, ProspectStatus, SiteStatus, demoData, emptyData } from "@/lib/backoffice";

type Store = { data: BackofficeData; demoMode: boolean; update: (fn: (current: BackofficeData) => BackofficeData) => void; loadDemo: () => void; setProspectStatus: (id: string, status: ProspectStatus) => void; convertProspect: (id: string) => void; setClientStatus: (id: string, status: ClientStatus) => void; setSiteStatus: (id: string, status: SiteStatus) => void; setSitePreview: (id: string, previewUrl: string) => void; addClientNote: (id: string, note: string) => void; addProspectNote: (id: string, note: string) => void; setRequestStatus: (id: string, status: ModificationRequest["status"]) => void; addSeoAction: (siteId: string, action: string, description: string) => void; };
const Context = createContext<Store | null>(null);
const STORAGE_KEY = "feaseweb-backoffice-v1";
const id = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export function BackofficeProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BackofficeData>(emptyData);
  const [demoMode, setDemoMode] = useState(false);
  // localStorage is the intentionally local persistence boundary for this pre-backend lot.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const stored = window.localStorage.getItem(STORAGE_KEY); if (stored) { try { setData(JSON.parse(stored)); setDemoMode(stored.includes("DONNÉE DE DÉMONSTRATION")); } catch { setData(emptyData); } } }, []);
  const update = (fn: (current: BackofficeData) => BackofficeData) => setData((current) => { const next = fn(current); window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next; });
  const loadDemo = () => { const next = demoData(); setData(next); setDemoMode(true); window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };
  const store = useMemo<Store>(() => ({ data, demoMode, update, loadDemo,
    setProspectStatus: (prospectId, status) => update((current) => ({ ...current, prospects: current.prospects.map((p) => p.id === prospectId ? { ...p, status } : p), activity: [{ id: id("activity"), occurredAt: new Date().toISOString(), actor: "admin", entityType: "prospect", entityId: prospectId, message: `Statut prospect → ${status}` }, ...current.activity] })),
    convertProspect: (prospectId) => update((current) => { const prospect = current.prospects.find((item) => item.id === prospectId); if (!prospect || current.clients.some((client) => client.prospectId === prospectId)) return current; const clientId = id("client"); const siteId = id("site"); return { ...current, prospects: current.prospects.map((item) => item.id === prospectId ? { ...item, status: "gagne" } : item), clients: [...current.clients, { id: clientId, prospectId, firstName: prospect.firstName, lastName: prospect.lastName, company: prospect.company, email: prospect.email, phone: prospect.phone, startedAt: new Date().toISOString(), status: "en_attente", offer: "FeaseWeb — 49 €/mois", siteId, notes: [] }], sites: [...current.sites, { id: siteId, clientId, name: prospect.company, slug: prospect.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), previewUrl: "", finalDomain: "", repository: "", host: "", createdAt: new Date().toISOString(), status: "a_preparer", technicalNotes: "" }], activity: [{ id: id("activity"), occurredAt: new Date().toISOString(), actor: "admin", entityType: "prospect", entityId: prospectId, message: "Prospect converti en client." }, ...current.activity] }; }),
    setClientStatus: (clientId, status) => update((current) => ({ ...current, clients: current.clients.map((client) => client.id === clientId ? { ...client, status } : client) })),
    setSiteStatus: (siteId, status) => update((current) => ({ ...current, sites: current.sites.map((site) => site.id === siteId ? { ...site, status } : site), activity: [{ id: id("activity"), occurredAt: new Date().toISOString(), actor: "admin", entityType: "site", entityId: siteId, message: `Étape de production → ${status}` }, ...current.activity] })),
    setSitePreview: (siteId, previewUrl) => update((current) => ({ ...current, sites: current.sites.map((site) => site.id === siteId ? { ...site, previewUrl } : site), activity: [{ id: id("activity"), occurredAt: new Date().toISOString(), actor: "admin", entityType: "site", entityId: siteId, message: "URL de preview renseignée." }, ...current.activity] })),
    addClientNote: (clientId, note) => update((current) => ({ ...current, clients: current.clients.map((client) => client.id === clientId ? { ...client, notes: [...client.notes, note] } : client), activity: [{ id: id("activity"), occurredAt: new Date().toISOString(), actor: "admin", entityType: "client", entityId: clientId, message: "Note interne ajoutée." }, ...current.activity] })),
    addProspectNote: (prospectId, note) => update((current) => ({ ...current, prospects: current.prospects.map((prospect) => prospect.id === prospectId ? { ...prospect, notes: [...prospect.notes, note] } : prospect), activity: [{ id: id("activity"), occurredAt: new Date().toISOString(), actor: "admin", entityType: "prospect", entityId: prospectId, message: "Note interne ajoutée." }, ...current.activity] })),
    setRequestStatus: (requestId, status) => update((current) => ({ ...current, requests: current.requests.map((request) => request.id === requestId ? { ...request, status, resolvedAt: status === "terminee" ? new Date().toISOString() : request.resolvedAt } : request) })),
    addSeoAction: (siteId, action, description) => update((current) => ({ ...current, seoActions: [{ id: id("seo"), siteId, date: new Date().toISOString(), action, description, status: "terminee" }, ...current.seoActions] })),
  }), [data, demoMode]);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useBackoffice() { const context = useContext(Context); if (!context) throw new Error("useBackoffice doit être utilisé dans BackofficeProvider"); return context; }
