"use client";

import { useState } from "react";
import { formatAppointmentDate } from "@/lib/client-order-timeline";

type Appointment = { appointment_status?: string | null; appointment_date?: string | null; appointment_time?: string | null } | null;

export function ClientAppointmentCard({ initialAppointment }: { initialAppointment: Appointment }) {
  const [appointment, setAppointment] = useState(initialAppointment);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scheduled = appointment?.appointment_status === "scheduled";
  const completed = appointment?.appointment_status === "completed";

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/prospect/appointment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, time, note: null }) });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Impossible d'enregistrer le rendez-vous.");
      setAppointment(body.appointment); setDate(""); setTime("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible d'enregistrer le rendez-vous."); }
    finally { setLoading(false); }
  }

  async function cancel() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/prospect/appointment", { method: "DELETE" });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "Impossible d'annuler le rendez-vous.");
      setAppointment(body.appointment);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible d'annuler le rendez-vous."); }
    finally { setLoading(false); }
  }

  return <section className="client-card client-appointment-card" aria-labelledby="client-appointment-title"><p className="client-eyebrow">RENDEZ-VOUS</p><h2 id="client-appointment-title">{completed ? "Rendez-vous effectué ✓" : scheduled ? "Votre prochain rendez-vous" : "Vous n'avez pas encore de rendez-vous."}</h2>{completed ? <p className="client-muted-note">Votre échange avec FeaseWeb est terminé.</p> : scheduled ? <><p className="client-muted-note">{formatAppointmentDate(appointment?.appointment_date, appointment?.appointment_time) ?? "Rendez-vous planifié"}</p><button type="button" className="client-button secondary" disabled={loading} onClick={() => void cancel()}>Annuler le rendez-vous</button></> : <form className="client-appointment-form" onSubmit={(event) => void submit(event)}><label>Date<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>Heure<input required type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><button className="client-button" type="submit" disabled={loading}>{loading ? "Enregistrement…" : "Prendre rendez-vous"}</button></form>}{error && <p className="client-form-error" role="alert">{error}</p>}</section>;
}
