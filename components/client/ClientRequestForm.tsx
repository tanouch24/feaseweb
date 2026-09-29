"use client";
/* eslint-disable react/no-unescaped-entities */

import { FormEvent, useState } from "react";

export function ClientRequestForm({ compact = false, supportOnly = false, label }: { compact?: boolean; supportOnly?: boolean; label?: string }) {
  const [form, setForm] = useState({ title: "", category: "Modification", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [expanded, setExpanded] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setState("sending"); setErrorMessage("");
    const response = await fetch(supportOnly ? "/api/onboarding/support" : "/api/client/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(supportOnly ? { message: form.message } : form) }).catch(() => null);
    if (response?.ok) { setForm({ title: "", category: "Modification", message: "" }); setState("success"); } else { const body = await response?.json().catch(() => null); setErrorMessage(body?.error ?? "La demande n'a pas pu être envoyée. Réessayez plus tard."); setState("error"); }
  };
  if (compact && !expanded) return <section className="client-card client-request-form-compact"><p className="client-eyebrow">{supportOnly ? "CONTACT" : "DEMANDE DE MODIFICATION"}</p><button type="button" className="client-button" onClick={() => setExpanded(true)}>{label ?? (supportOnly ? "Envoyer un message à FeaseWeb" : "Faire une demande de modification")}</button></section>;
  return <form className={`client-request-form${compact ? " client-request-form-compact" : ""}`} onSubmit={submit}>{compact && <><p className="client-eyebrow">CONTACT</p><h2>{supportOnly ? "Envoyer un message à FeaseWeb" : "Faire une demande"}</h2></>}{!compact && <p className="client-card-lead">Besoin d'une modification ou d'un ajout sur votre site ? Envoyez-nous votre demande directement depuis votre espace.</p>}{!supportOnly && <><label>Titre<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={180} required placeholder="Mettre à jour mes horaires" /></label><label>Type<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Modification</option><option>Ajout</option></select></label></>}<label>Votre message<textarea aria-label="Votre message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} maxLength={5000} required placeholder={supportOnly ? "Écrivez votre message à FeaseWeb…" : "Expliquez ce que vous souhaitez modifier…"} /></label><button className="client-button" type="submit" disabled={state === "sending"}>{state === "sending" ? "Envoi…" : compact ? "Envoyer" : "Faire une demande"}</button>{state === "success" && <p className="client-form-message">{supportOnly ? "Votre message a bien été envoyé." : "Votre demande a bien été reçue."}</p>}{state === "error" && <p className="client-form-error">{errorMessage}</p>}</form>;
}
