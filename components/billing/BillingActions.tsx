"use client";

import { useState } from "react";

async function goTo(endpoint: string, setError: (message: string) => void, setLoading: (value: boolean) => void) {
  setLoading(true);
  setError("");
  try {
    const response = await fetch(endpoint, { method: "POST" });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.url) {
      setError(body?.error ?? "Action impossible pour le moment.");
      setLoading(false);
      return;
    }
    window.location.assign(body.url);
  } catch {
    setError("Action impossible pour le moment.");
    setLoading(false);
  }
}

export function StartSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={() => goTo("/api/billing/checkout", setError, setLoading)}
        className="inline-flex items-center justify-center rounded-sm bg-brand px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Redirection…" : "S'abonner — 49 €/mois"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={() => goTo("/api/billing/portal", setError, setLoading)}
        className="inline-flex items-center justify-center rounded-sm border border-line px-6 py-3 text-[15px] font-medium text-ink transition-colors hover:border-ink disabled:opacity-60"
      >
        {loading ? "Redirection…" : "Gérer mon abonnement"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
