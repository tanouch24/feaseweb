"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { BackofficeData, ClientStatus, ClientUpdate, ModificationRequest, ProspectStatus, SiteStatus } from "@/lib/backoffice";

type Store = {
  data: BackofficeData; ready: boolean; error: string | null; refresh: () => Promise<void>;
  setProspectStatus: (id: string, status: ProspectStatus) => Promise<void>;
  convertProspect: (id: string) => Promise<void>;
  setClientStatus: (id: string, status: ClientStatus) => Promise<void>;
  setSiteStatus: (id: string, status: SiteStatus) => Promise<void>;
  setSitePreview: (id: string, previewUrl: string) => Promise<void>;
  addClientNote: (id: string, note: string) => Promise<void>;
  inviteClient: (id: string) => Promise<void>;
  addProspectNote: (id: string, note: string) => Promise<void>;
  scheduleProspectAppointment: (id: string, date: string, time: string) => Promise<void>;
  updateProspectReview: (id: string, action: "complete_appointment" | "cancel_appointment" | "approve" | "needs_information" | "decline", note?: string) => Promise<void>;
  setRequestStatus: (id: string, status: ModificationRequest["status"]) => Promise<void>;
  addSeoAction: (siteId: string, action: string, description: string) => Promise<void>;
  createClientUpdate: (input: { clientId: string; siteId?: string; updateType: ClientUpdate["updateType"]; actionType?: ClientUpdate["actionType"]; title: string; message: string }) => Promise<{ emailSent: boolean; warning?: string }>;
  updateClientUpdate: (id: string, input: { siteId?: string | null; updateType?: ClientUpdate["updateType"]; actionType?: ClientUpdate["actionType"] | null; title?: string; message?: string }) => Promise<void>;
  deleteClientUpdate: (id: string) => Promise<void>;
  setProjectStatus: (id: string, status: string) => Promise<void>;
};
const Context = createContext<Store | null>(null);

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(body?.error ?? "Une erreur est survenue."); }
  return response.json().catch(() => null);
}

export function BackofficeProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BackofficeData>({ prospects: [], clients: [], sites: [], subscriptions: [], payments: [], requests: [], clientUpdates: [], projectIntakes: [], seoActions: [], seoMetrics: [], domains: [], activity: [] });
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
    inviteClient: async (id) => { await api(`/api/admin/clients/${id}/invite`, { method: "POST", body: JSON.stringify({}) }); await refresh(); },
    addProspectNote: async (id, body) => { await api("/api/admin/notes", { method: "POST", body: JSON.stringify({ prospectId: id, body }) }); await refresh(); },
    scheduleProspectAppointment: async (id, date, time) => { await api(`/api/admin/prospects/${id}/review`, { method: "PATCH", body: JSON.stringify({ action: "schedule_appointment", date, time }) }); await refresh(); },
    updateProspectReview: async (id, action, note) => { await api(`/api/admin/prospects/${id}/review`, { method: "PATCH", body: JSON.stringify({ action, note: note ?? null }) }); await refresh(); },
    setRequestStatus: (id, status) => mutate(`/api/admin/requests/${id}`, { status }),
    addSeoAction: async (siteId, action, description) => { await api("/api/admin/seo/actions", { method: "POST", body: JSON.stringify({ siteId, action, description }) }); await refresh(); },
    createClientUpdate: async (input) => { const idempotencyKey = crypto.randomUUID(); const result = await api("/api/admin/client-updates", { method: "POST", headers: { "Idempotency-Key": idempotencyKey }, body: JSON.stringify(input) }); await refresh(); return { emailSent: Boolean(result?.emailSent), warning: typeof result?.warning === "string" ? result.warning : undefined }; },
    updateClientUpdate: async (id, input) => { await api(`/api/admin/client-updates/${id}`, { method: "PATCH", body: JSON.stringify(input) }); await refresh(); },
    deleteClientUpdate: async (id) => { await api(`/api/admin/client-updates/${id}`, { method: "DELETE" }); await refresh(); },
    setProjectStatus: (id, status) => mutate(`/api/admin/project-intakes/${id}`, { status }),
  };
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useBackoffice() { const context = useContext(Context); if (!context) throw new Error("useBackoffice doit être utilisé dans BackofficeProvider"); return context; }
