import { z } from "zod";

export const appointmentStatuses = ["not_scheduled", "scheduled", "completed", "cancelled"] as const;
export const validationStatuses = ["pending", "approved", "needs_information", "declined"] as const;
export type AppointmentStatus = typeof appointmentStatuses[number];
export type ValidationStatus = typeof validationStatuses[number];

export const projectReviewSelect = "id, project_intake_id, appointment_status, appointment_date, appointment_time, phone, note, created_at, updated_at";

export type ProjectAppointment = {
  id: string;
  projectIntakeId: string;
  status: AppointmentStatus;
  date: string | null;
  time: string | null;
  phone: string | null;
  note: string | null;
};

export type ProjectValidation = {
  id: string;
  projectIntakeId: string;
  status: ValidationStatus;
  decidedAt: string | null;
  decidedBy: string | null;
  internalNote?: string | null;
};

export type ProjectReview = {
  appointment: ProjectAppointment | null;
  validation: Pick<ProjectValidation, "status">;
  approvalEventId?: string;
};

export const appointmentInputSchema = z.object({
  date: z.string().date(),
  time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Créneau invalide."),
  phone: z.string().trim().min(7).max(40).regex(/^[+()\d\s.-]+$/, "Téléphone invalide."),
  note: z.string().trim().max(1000).optional().nullable(),
}).strict();

export const adminReviewSchema = z.object({
  action: z.enum(["complete_appointment", "cancel_appointment", "approve", "needs_information", "decline"]),
  note: z.string().trim().max(5000).optional().nullable(),
}).strict();

export function mapProjectAppointment(row: Record<string, unknown>): ProjectAppointment {
  return {
    id: String(row.id),
    projectIntakeId: String(row.project_intake_id),
    status: appointmentStatuses.includes(row.appointment_status as AppointmentStatus) ? row.appointment_status as AppointmentStatus : "not_scheduled",
    date: typeof row.appointment_date === "string" ? row.appointment_date : null,
    time: typeof row.appointment_time === "string" ? row.appointment_time.slice(0, 5) : null,
    phone: typeof row.phone === "string" ? row.phone : null,
    note: typeof row.note === "string" ? row.note : null,
  };
}

export function mapProjectValidation(row?: Record<string, unknown> | null): ProjectValidation {
  const status = validationStatuses.includes(row?.validation_status as ValidationStatus) ? row?.validation_status as ValidationStatus : "pending";
  return { id: String(row?.id ?? ""), projectIntakeId: String(row?.project_intake_id ?? ""), status, decidedAt: typeof row?.decided_at === "string" ? row.decided_at : null, decidedBy: typeof row?.decided_by === "string" ? row.decided_by : null, internalNote: typeof row?.internal_note === "string" ? row.internal_note : null };
}

export function mapProjectReview(appointment?: Record<string, unknown> | null, validation?: Record<string, unknown> | null): ProjectReview {
  return { appointment: appointment ? mapProjectAppointment(appointment) : null, validation: { status: mapProjectValidation(validation).status } };
}

export const validationLabels: Record<ValidationStatus, string> = {
  pending: "Validation en attente",
  approved: "Projet validé",
  needs_information: "Informations nécessaires",
  declined: "Projet refusé",
};

export const appointmentLabels: Record<AppointmentStatus, string> = {
  not_scheduled: "Non planifié",
  scheduled: "Planifié",
  completed: "Réalisé",
  cancelled: "Annulé",
};
