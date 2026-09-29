export const appointmentAvailability = {
  daysAhead: 30,
  weekdays: [1, 2, 3, 4, 5],
  firstSlotMinutes: 9 * 60,
  lastSlotMinutes: 17 * 60,
  slotMinutes: 30,
} as const;

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function availableAppointmentDates(now = new Date()) {
  const dates: string[] = [];
  for (let offset = 0; offset <= appointmentAvailability.daysAhead; offset += 1) {
    const candidate = new Date(now);
    candidate.setHours(0, 0, 0, 0);
    candidate.setDate(candidate.getDate() + offset);
    if ((appointmentAvailability.weekdays as readonly number[]).includes(candidate.getDay())) dates.push(localDateKey(candidate));
  }
  return dates;
}

export function availableAppointmentSlots(date: string, now = new Date()) {
  if (!availableAppointmentDates(now).includes(date)) return [];
  const today = localDateKey(now);
  const slots: string[] = [];
  for (let minutes = appointmentAvailability.firstSlotMinutes; minutes <= appointmentAvailability.lastSlotMinutes; minutes += appointmentAvailability.slotMinutes) {
    if (date === today && minutes <= now.getHours() * 60 + now.getMinutes()) continue;
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
