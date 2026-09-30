"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { formatAppointmentDate } from "@/lib/client-order-timeline";
import { availableAppointmentDates, availableAppointmentSlots, formatAppointmentDay } from "@/lib/appointment-availability";

type Appointment = { appointment_status?: string | null; appointment_date?: string | null; appointment_time?: string | null } | null;
const calendarListeners = new Set<() => void>();
let calendarSnapshot = "[]";
function subscribeCalendar(listener: () => void) {
  calendarListeners.add(listener);
  if (calendarListeners.size === 1 && typeof window !== "undefined") queueMicrotask(() => { calendarSnapshot = JSON.stringify(availableAppointmentDates()); calendarListeners.forEach((item) => item()); });
  return () => calendarListeners.delete(listener);
}
const getCalendarSnapshot = () => calendarSnapshot;
const getServerCalendarSnapshot = () => "[]";

export function ClientAppointmentCard({ initialAppointment }: { initialAppointment: Appointment }) {
  const [appointment, setAppointment] = useState(initialAppointment);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const availableDates = JSON.parse(useSyncExternalStore(subscribeCalendar, getCalendarSnapshot, getServerCalendarSnapshot)) as string[];
  const availableSlots = JSON.parse(useSyncExternalStore(subscribeCalendar, () => JSON.stringify(date ? availableAppointmentSlots(date) : []), getServerCalendarSnapshot)) as string[];
  const scheduled = appointment?.appointment_status === "scheduled";
  const completed = appointment?.appointment_status === "completed";

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash !== "#rendez-vous") return;
      setExpanded(true);
      requestAnimationFrame(() => document.getElementById("rendez-vous")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

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

  if (!scheduled && !completed && !expanded) return <section className="client-card client-appointment-card" aria-labelledby="client-appointment-title"><p className="client-eyebrow">VOTRE RENDEZ-VOUS</p><h2 id="client-appointment-title">Aucun rendez-vous planifié.</h2>{error && <p className="client-form-error" role="alert">{error}</p>}</section>;

  return <section className="client-card client-appointment-card" aria-labelledby="client-appointment-title"><p className="client-eyebrow">RENDEZ-VOUS</p><h2 id="client-appointment-title">{completed ? "Rendez-vous effectué ✓" : scheduled ? "Votre prochain rendez-vous" : "Choisissez votre rendez-vous"}</h2>{completed ? <p className="client-muted-note">Votre échange avec FeaseWeb est terminé.</p> : scheduled ? <><p className="client-muted-note">{formatAppointmentDate(appointment?.appointment_date, appointment?.appointment_time) ?? "Rendez-vous planifié"}</p><button type="button" className="client-button secondary" disabled={loading} onClick={() => void cancel()}>Annuler le rendez-vous</button></> : <form className="client-appointment-form" onSubmit={(event) => void submit(event)}><fieldset><legend>Date</legend><div className="appointment-choice-grid">{availableDates.map((availableDate) => <button type="button" key={availableDate} aria-pressed={date === availableDate} className={date === availableDate ? "selected" : ""} onClick={() => setDate(availableDate)}>{formatAppointmentDay(availableDate)}</button>)}</div></fieldset><fieldset><legend>Heure</legend><div className="appointment-choice-grid appointment-time-grid">{availableSlots.map((slot) => <button type="button" key={slot} aria-pressed={time === slot} className={time === slot ? "selected" : ""} onClick={() => setTime(slot)}>{slot}</button>)}</div></fieldset><button className="client-button" type="submit" disabled={loading || !date || !time}>{loading ? "Enregistrement…" : "Confirmer mon rendez-vous"}</button></form>}{error && <p className="client-form-error" role="alert">{error}</p>}</section>;
}
