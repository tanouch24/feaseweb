"use client";

import { useState } from "react";

export function PasswordResetRequestForm() {
  const [state, setState] = useState<{ loading?: boolean; message?: string; error?: string }>({});
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState({ loading: true });
    const email = new FormData(event.currentTarget).get("email");
    const response = await fetch("/api/auth/password-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const body = await response.json().catch(() => null);
    setState(response.ok ? { message: body?.message } : { error: body?.error ?? "Impossible d'envoyer le lien." });
  }
  return <form className="mt-8 space-y-5" onSubmit={submit}><label className="block text-sm font-medium text-ink" htmlFor="reset-email">Email<input id="reset-email" name="email" type="email" required className="mt-1.5 w-full rounded-sm border border-line px-3 py-2" /></label><button className="w-full rounded-sm bg-brand px-6 py-3 text-[15px] font-medium text-white" disabled={state.loading}>{state.loading ? "Envoi…" : "Envoyer le lien"}</button>{state.message && <p role="status" className="text-sm text-brand">{state.message}</p>}{state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}</form>;
}

export function NewPasswordForm({ submitLabel = "Enregistrer mon nouveau mot de passe" }: { submitLabel?: string }) {
  const [state, setState] = useState<{ loading?: boolean; error?: string }>({});
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState({ loading: true });
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/update-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: form.get("password"), confirmation: form.get("confirmation") }) });
    const body = await response.json().catch(() => null);
    if (!response.ok) { setState({ error: body?.error ?? "Impossible d'enregistrer le mot de passe." }); return; }
    window.location.assign(body.redirect);
  }
  return <form className="mt-8 space-y-5" onSubmit={submit}><label className="block text-sm font-medium text-ink" htmlFor="new-password">Nouveau mot de passe<input id="new-password" name="password" type="password" minLength={8} required className="mt-1.5 w-full rounded-sm border border-line px-3 py-2" /></label><label className="block text-sm font-medium text-ink" htmlFor="new-password-confirmation">Confirmer le mot de passe<input id="new-password-confirmation" name="confirmation" type="password" minLength={8} required className="mt-1.5 w-full rounded-sm border border-line px-3 py-2" /></label><button className="w-full rounded-sm bg-brand px-6 py-3 text-[15px] font-medium text-white" disabled={state.loading}>{state.loading ? "Enregistrement…" : submitLabel}</button>{state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}</form>;
}
