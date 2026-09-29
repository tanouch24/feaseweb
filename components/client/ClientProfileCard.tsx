"use client";

import { useEffect, useState } from "react";

type Profile = { firstName: string; lastName: string; company: string; phone: string; email: string };

export function ClientProfileCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { void fetch("/api/client/profile", { credentials: "same-origin" }).then((response) => response.ok ? response.json() : null).then((body) => { if (body?.profile) setProfile(body.profile); }); }, []);
  if (!profile) return null;
  async function save(event: React.FormEvent) { event.preventDefault(); if (!draft) return; const response = await fetch("/api/client/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify(draft) }); if (!response.ok) { setMessage("Impossible d'enregistrer vos informations."); return; } setProfile(draft); setEditing(false); setMessage("Informations enregistrées."); }
  return <section className="client-card" aria-labelledby="client-profile-title"><p className="client-eyebrow">MON PROFIL</p><h2 id="client-profile-title">Vos informations</h2>{editing && draft ? <form className="client-form" onSubmit={(event) => void save(event)}>{(["firstName", "lastName", "company", "phone"] as const).map((field) => <label key={field}>{field === "firstName" ? "Prénom" : field === "lastName" ? "Nom" : field === "company" ? "Entreprise" : "Téléphone"}<input value={draft[field]} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} required={field !== "phone"} /></label>)}<p className="client-muted-note">Email de connexion : {profile.email}. Il se modifie depuis la procédure de sécurité du compte.</p><button className="client-button" type="submit">Enregistrer</button><button className="client-button secondary" type="button" onClick={() => setEditing(false)}>Annuler</button></form> : <><dl className="client-profile-list"><div><dt>Prénom</dt><dd>{profile.firstName}</dd></div><div><dt>Nom</dt><dd>{profile.lastName}</dd></div><div><dt>Entreprise</dt><dd>{profile.company}</dd></div><div><dt>Email</dt><dd>{profile.email}</dd></div><div><dt>Téléphone</dt><dd>{profile.phone || "Non renseigné"}</dd></div></dl><button className="client-button secondary" type="button" onClick={() => { setDraft(profile); setEditing(true); }}>Modifier mes informations</button></>}{message && <p className="client-muted-note" role="status">{message}</p>}</section>;
}
