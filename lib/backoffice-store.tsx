"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { BackofficeData, ClientStatus, ModificationRequest, ProspectStatus, SiteStatus } from "@/lib/backoffice";

type Store = {
  data: BackofficeData; ready: boolean; error: string | null; refresh: () => Promise<void>;
  setProspectStatus: (id: string, status: ProspectStatus) => Promise<void>;
  convertProspect: (id: string) => Promise<void>;
  setClientStatus: (id: string, status: ClientStatus) => Promise<void>;
  setSiteStatus: (id: string, status: SiteStatus) => Promise<void>;
  setSitePreview: (id: string, previewUrl: string) => Promise<void>;
  addClientNote: (id: string, note: string) => Promise<void>;
  addProspectNote: (id: string, note: string) => Promise<void>;
  setRequestStatus: (id: string, status: ModificationRequest["status"]) => Promise<void>;
  addSeoAction: (siteId: string, action: string, description: string) => Promise<void>;
};
const Context = createContext<Store | null>(null);

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(body?.error ?? "Une erreur est survenue."); }
  return response.json().catch(() => null);
}

export function BackofficeProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BackofficeData>({ prospects: [], clients: [], sites: [], subscriptions: [], payments: [], requests: [], seoActions: [], seoMetrics: [], domains: [], activity: [] });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => { try { const result = await api("/api/admin/bootstrap", { headers: {} }); setData(result.data); setError(null); } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible de charger les données."); } finally { setReady(true); } };
  // The effect synchronizes this client store with the protected server endpoint.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void refresh(); }, []);
  const mutate = async (path: string, body: unknown) => { await api(path, { method: "PATCH", body: JSON.stringify(body) }); await refresh(); };
  const store: Store = { data, ready, error, refresh,
    setProspectStatus: (id, status) => mutate(`/api/admin/prospects/${id}`, { status }),
    convertProspect: async (id) => { await api(`/api/admin/prospects/${id}/convert`, { method: "POST", body: JSON.stringify({}) }); await refresh(); },
    setClientStatus: (id, status) => mutate(`/api/admin/clients/${id}`, { status }),
    setSiteStatus: (id, status) => mutate(`/api/admin/sites/${id}`, { status }),
    setSitePreview: async (id, previewUrl) => { await mutate(`/api/admin/sites/${id}`, { previewUrl }); },
    addClientNote: async (id, body) => { await api("/api/admin/notes", { method: "POST", body: JSON.stringify({ clientId: id, body }) }); await refresh(); },
    addProspectNote: async (id, body) => { await api("/api/admin/notes", { method: "POST", body: JSON.stringify({ prospectId: id, body }) }); await refresh(); },
    setRequestStatus: (id, status) => mutate(`/api/admin/requests/${id}`, { status }),
    addSeoAction: async (siteId, action, description) => { await api("/api/admin/seo/actions", { method: "POST", body: JSON.stringify({ siteId, action, description }) }); await refresh(); },
  };
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useBackoffice() { const context = useContext(Context); if (!context) throw new Error("useBackoffice doit être utilisé dans BackofficeProvider"); return context; }
