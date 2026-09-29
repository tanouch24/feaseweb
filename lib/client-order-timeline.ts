export type ClientOrderStageKey = "requested" | "appointment" | "payment" | "building" | "delivered";
export type ClientOrderStage = { key: ClientOrderStageKey; label: string; state: "complete" | "current" | "upcoming"; detail?: string };

export const DELIVERY_ESTIMATE_CALENDAR_DAYS = 5;

export function addCalendarDays(isoDate: string, days = DELIVERY_ESTIMATE_CALENDAR_DAYS) {
  const result = new Date(`${isoDate.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(result.getTime())) return null;
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

export function formatClientDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export function formatAppointmentDate(date: string | null | undefined, time: string | null | undefined) {
  const formatted = formatClientDate(date);
  return formatted ? `${formatted}${time ? ` à ${time}` : ""}` : null;
}

export function clientOrderTimeline(input: {
  appointmentStatus?: string | null;
  appointmentDate?: string | null;
  appointmentTime?: string | null;
  paymentConfirmed: boolean;
  paymentDate?: string | null;
  live: boolean;
  hasProject: boolean;
}): ClientOrderStage[] {
  const appointmentDone = input.appointmentStatus === "completed" || input.paymentConfirmed || input.live;
  const appointmentScheduled = input.appointmentStatus === "scheduled";
  const delivery = input.paymentDate ? addCalendarDays(input.paymentDate) : null;
  const appointmentDetail = appointmentScheduled
    ? formatAppointmentDate(input.appointmentDate, input.appointmentTime) ?? "Rendez-vous planifié"
    : input.appointmentStatus === "completed" ? "Rendez-vous effectué" : undefined;
  return [
    { key: "requested", label: "Demande envoyée", state: input.hasProject ? "complete" : "current" },
    { key: "appointment", label: "Rendez-vous", state: appointmentDone ? "complete" : appointmentScheduled ? "current" : "upcoming", detail: appointmentDetail },
    { key: "payment", label: "Paiement", state: input.paymentConfirmed ? "complete" : input.hasProject ? "current" : "upcoming", detail: input.paymentConfirmed ? "Paiement effectué" : undefined },
    { key: "building", label: "Création du site", state: input.paymentConfirmed ? (input.live ? "complete" : "current") : "upcoming", detail: input.paymentConfirmed && !input.live ? "Votre site est en création" : undefined },
    { key: "delivered", label: "Site en ligne", state: input.live ? "complete" : "upcoming", detail: input.live ? "Votre site est en ligne" : delivery ? `Livraison estimée le ${formatClientDate(delivery)}` : undefined },
  ];
}
