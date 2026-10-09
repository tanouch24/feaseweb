export const appointmentAvailability = {
  daysAhead: 30,
  weekdays: [1, 2, 3, 4, 5],
  firstSlotMinutes: 9 * 60,
  lastSlotMinutes: 17 * 60,
  slotMinutes: 30,
  // Les créneaux sont des heures de Paris, quel que soit le fuseau du serveur
  // (Netlify tourne en UTC) ou du navigateur.
  timeZone: "Europe/Paris",
} as const;

/** Date du jour (AAAA-MM-JJ) et minutes écoulées, à l'heure de Paris. */
function parisNow(now: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: appointmentAvailability.timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(now)
      .map((part) => [part.type, part.value])
  );
  return { today: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

export function availableAppointmentDates(now = new Date()) {
  const [year, month, day] = parisNow(now).today.split("-").map(Number);
  const dates: string[] = [];
  for (let offset = 0; offset <= appointmentAvailability.daysAhead; offset += 1) {
    const candidate = new Date(Date.UTC(year, month - 1, day + offset));
    if ((appointmentAvailability.weekdays as readonly number[]).includes(candidate.getUTCDay())) dates.push(candidate.toISOString().slice(0, 10));
  }
  return dates;
}

export function availableAppointmentSlots(date: string, now = new Date()) {
  if (!availableAppointmentDates(now).includes(date)) return [];
  const paris = parisNow(now);
  const slots: string[] = [];
  for (let minutes = appointmentAvailability.firstSlotMinutes; minutes <= appointmentAvailability.lastSlotMinutes; minutes += appointmentAvailability.slotMinutes) {
    if (date === paris.today && minutes <= paris.minutes) continue;
    slots.push(`${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`);
  }
  return slots;
}

export function isBookableAppointment(date: string, time: string, now = new Date()) {
  return availableAppointmentSlots(date, now).includes(time);
}

export function formatAppointmentDay(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`));
}
