"use client";
/* eslint-disable react/no-unescaped-entities */

import { useState } from "react";

export function DemoLeadForm({ mode }: { mode: "create" | "redesign" }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (submitted) return <div className="rounded-lg border border-line bg-white p-8 text-center"><p className="font-serif text-xl text-ink">Votre demande a bien été reçue.</p><p className="mt-2 text-ink-soft">Merci pour les informations transmises. FeaseWeb peut maintenant étudier votre besoin.</p></div>;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/prospects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, hasExistingSite: mode === "redesign", source: "site FeaseWeb" }) });
    const body = await response.json().catch(() => null);
    setLoading(false);
    if (!response.ok) { setError(body?.error ?? "Impossible d'envoyer la demande pour le moment."); return; }
    setSubmitted(true);
  }
  return <form className="space-y-5 rounded-lg border border-line bg-white p-8" onSubmit={submit}>
    <div className="grid gap-5 md:grid-cols-2"><div><label htmlFor="first-name" className="text-sm font-medium text-ink">Prénom</label><input id="first-name" name="firstName" type="text" required className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand" /></div><div><label htmlFor="last-name" className="text-sm font-medium text-ink">Nom</label><input id="last-name" name="lastName" type="text" required className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand" /></div></div>
    <div><label htmlFor="company-name" className="text-sm font-medium text-ink">Nom de votre entreprise</label><input id="company-name" name="company" type="text" required className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand" /></div>
    {mode === "redesign" && <div><label htmlFor="current-url" className="text-sm font-medium text-ink">Adresse de votre site actuel</label><input id="current-url" name="existingSiteUrl" type="url" required placeholder="https://" className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand" /></div>}
    <div className="grid gap-5 md:grid-cols-2"><div><label htmlFor="lead-email" className="text-sm font-medium text-ink">Votre email</label><input id="lead-email" name="email" type="email" required className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand" /></div><div><label htmlFor="lead-phone" className="text-sm font-medium text-ink">Téléphone</label><input id="lead-phone" name="phone" type="tel" className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand" /></div></div>
    <div className="grid gap-5 md:grid-cols-2"><div><label htmlFor="lead-activity" className="text-sm font-medium text-ink">Activité</label><input id="lead-activity" name="activity" type="text" className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand" /></div><div><label htmlFor="lead-city" className="text-sm font-medium text-ink">Ville</label><input id="lead-city" name="city" type="text" className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand" /></div></div>
    <div><label htmlFor="lead-objective" className="text-sm font-medium text-ink">Votre objectif</label><input id="lead-objective" name="objective" type="text" className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand" /></div>
    <div><label htmlFor="lead-message" className="text-sm font-medium text-ink">Votre besoin</label><textarea id="lead-message" name="message" rows={4} className="mt-1.5 w-full rounded-sm border border-line px-3 py-2 focus:outline-brand" /></div>
    <div className="flex items-start gap-3"><input id="privacy-consent" name="privacyConsent" value="true" type="checkbox" required className="mt-1" /><label htmlFor="privacy-consent" className="text-xs leading-5 text-ink-soft">J'accepte que FeaseWeb utilise ces informations pour répondre à ma demande, conformément à la politique de confidentialité.</label></div>
    <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px opacity-0" />
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-sm bg-brand px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60">{loading ? "Envoi…" : "Envoyer ma demande"}</button>
  </form>;
}
