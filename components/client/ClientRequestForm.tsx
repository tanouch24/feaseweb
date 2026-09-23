"use client";
/* eslint-disable react/no-unescaped-entities */

import { FormEvent, useState } from "react";

export function ClientRequestForm() {
  const [form, setForm] = useState({ title: "", category: "Contenu", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setState("sending");
    const response = await fetch("/api/client/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).catch(() => null);
    if (response?.ok) { setForm({ title: "", category: "Contenu", message: "" }); setState("success"); } else setState("error");
  };
  return <form className="client-request-form" onSubmit={submit}><label>Titre<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={180} required placeholder="Mettre à jour mes horaires" /></label><label>Catégorie<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Contenu</option><option>Site</option><option>Information</option><option>Autre</option></select></label><label>Votre demande<textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} maxLength={5000} required placeholder="Expliquez ce que vous souhaitez modifier…" /></label><button className="client-button" type="submit" disabled={state === "sending"}>{state === "sending" ? "Envoi…" : "Envoyer la demande"}</button>{state === "success" && <p className="client-form-message">Votre demande a bien été reçue.</p>}{state === "error" && <p className="client-form-error">La demande n'a pas pu être envoyée. Réessayez plus tard.</p>}</form>;
}
