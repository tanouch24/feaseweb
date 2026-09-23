"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function AccountCreationForm() {
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [confirmation, setConfirmation] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/onboarding/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const body = await response.json().catch(() => null); setLoading(false);
    if (!response.ok) { setError(body?.error ?? "Impossible de créer votre espace."); return; }
    if (body?.needsConfirmation) { setConfirmation(true); return; }
    window.location.assign(body?.redirect ?? "/creer-mon-site");
  }
  if (confirmation) return <div className="rounded-sm border border-line bg-bg-alt p-6" role="status"><h2 className="font-serif text-2xl text-ink">Vérifiez votre email</h2><p className="mt-3 text-sm text-ink-soft">Si la confirmation email est activée, un lien vous permettra de poursuivre la configuration de votre projet.</p><Link className="mt-6 inline-flex text-sm font-medium text-brand underline" href="/connexion">Aller à la connexion</Link></div>;
  const field = (id: string, label: string, type = "text", required = true) => <label className="block text-sm font-medium text-ink" htmlFor={id}>{label}<input id={id} name={id} type={type} required={required} className="mt-1.5 w-full rounded-sm border border-line bg-white px-3 py-2.5" /></label>;
  return <form onSubmit={submit} className="space-y-5 rounded-sm border border-line bg-white p-6 shadow-sm">{error && <p role="alert" className="rounded-sm bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="grid gap-5 sm:grid-cols-2">{field("firstName", "Prénom")}{field("lastName", "Nom")}</div>{field("company", "Entreprise")}{field("email", "Email", "email")}{field("phone", "Téléphone", "tel", false)}<div className="grid gap-5 sm:grid-cols-2">{field("password", "Mot de passe", "password")}{field("confirmation", "Confirmation", "password")}</div><label className="flex gap-3 text-sm text-ink-soft"><input name="privacyConsent" type="checkbox" value="true" required className="mt-1" /> <span>J’accepte que FeaseWeb utilise ces informations pour préparer mon projet et me contacter.</span></label><button className="w-full rounded-sm bg-brand px-5 py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-60" disabled={loading}>{loading ? "Création…" : "Créer mon espace"}</button><p className="text-center text-sm text-ink-soft">Vous avez déjà un espace ? <Link className="font-medium text-brand underline" href="/connexion">Se connecter</Link></p></form>;
}
