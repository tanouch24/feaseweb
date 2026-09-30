"use client";

import { useEffect, useState } from "react";

type Profile = { firstName: string; lastName: string; company: string; phone: string; email: string };

export function ClientProfileCard({ drawer = false, label = "Mon profil" }: { drawer?: boolean; label?: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { void fetch("/api/client/profile", { credentials: "same-origin" }).then((response) => response.ok ? response.json() : null).then((body) => { if (body?.profile) setProfile(body.profile); }); }, []);
  useEffect(() => { if (!open) return; const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; document.addEventListener("keydown", closeOnEscape); return () => document.removeEventListener("keydown", closeOnEscape); }, [open]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const response = await fetch("/api/client/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify(draft) });
    if (!response.ok) { setMessage("Impossible d'enregistrer vos informations."); return; }
    setProfile(draft); setEditing(false); setMessage("Informations enregistrées.");
  }

  const content = !profile ? <p className="client-muted-note">Chargement de vos informations…</p> : editing && draft ? <form className="client-profile-form" onSubmit={(event) => void save(event)}>{(["firstName", "lastName", "company", "phone"] as const).map((field) => <label key={field}>{field === "firstName" ? "Prénom" : field === "lastName" ? "Nom" : field === "company" ? "Entreprise" : "Téléphone"}<input value={draft[field]} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} required={field !== "phone"} /></label>)}<div className="client-profile-email"><span>Email</span><strong>{profile.email}</strong><small>Email non modifiable depuis cet espace.</small></div><div className="client-profile-actions"><button className="client-button" type="submit">Enregistrer</button><button className="client-button secondary" type="button" onClick={() => { setEditing(false); setMessage(""); }}>Annuler</button></div></form> : <><dl className="client-profile-list"><div><dt>Prénom</dt><dd>{profile?.firstName}</dd></div><div><dt>Nom</dt><dd>{profile?.lastName}</dd></div><div><dt>Entreprise</dt><dd>{profile?.company}</dd></div><div><dt>Email</dt><dd>{profile?.email}</dd></div><div><dt>Téléphone</dt><dd>{profile?.phone || "Non renseigné"}</dd></div></dl><button className="client-button secondary" type="button" onClick={() => { if (profile) setDraft(profile); setEditing(true); setMessage(""); }}>Modifier mes informations</button></>;

  if (!drawer) return <section id="mon-profil" className="client-card client-profile-card" aria-labelledby="client-profile-title"><p className="client-eyebrow">MON PROFIL</p><h2 id="client-profile-title">Vos informations</h2>{content}{message && <p className="client-muted-note" role="status">{message}</p>}</section>;
  return <><button type="button" className="client-header-link client-profile-trigger" aria-expanded={open} aria-controls="client-profile-drawer" onClick={() => setOpen(true)}>{label}</button>{open && <div className="client-profile-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><aside id="client-profile-drawer" className="client-profile-drawer" role="dialog" aria-modal="true" aria-labelledby="client-profile-drawer-title"><div className="client-profile-drawer-head"><div><p className="client-eyebrow">MON PROFIL</p><h2 id="client-profile-drawer-title">Vos informations</h2></div><button type="button" className="client-profile-close" aria-label="Fermer le profil" onClick={() => setOpen(false)}>×</button></div>{content}{message && <p className="client-profile-feedback" role="status">{message}</p>}</aside></div>}</>;
}
