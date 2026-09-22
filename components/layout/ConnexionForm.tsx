"use client";

import { useState } from "react";

export function ConnexionForm() {
  const [state, setState] = useState<{ error?: string; loading?: boolean }>({});
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState({ loading: true });
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
    const body = await response.json().catch(() => null);
    if (!response.ok) { setState({ error: body?.error ?? "Connexion impossible." }); return; }
    window.location.assign(body.redirect);
  }
  return (
    <form className="mt-8 space-y-5" onSubmit={submit}>
      <div>
        <label htmlFor="login-email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="text-sm font-medium text-ink">
          Mot de passe
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand"
        />
      </div>
      <button
        type="submit"
        disabled={state.loading}
        className="w-full rounded-sm bg-brand px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-brand-dark"
      >
        {state.loading ? "Connexion…" : "Se connecter"}
      </button>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
