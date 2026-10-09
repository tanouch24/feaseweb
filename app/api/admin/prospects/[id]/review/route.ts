import { NextResponse } from "next/server";
import { onAppointmentScheduledByAdmin, onPaymentRequested } from "@/lib/notifications";
import { requireApiAdmin } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminReviewSchema, adminScheduleAppointmentSchema } from "@/lib/project-review";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  const parsed = payload?.action === "schedule_appointment"
    ? adminScheduleAppointmentSchema.safeParse(payload)
    : adminReviewSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Action de dossier invalide." }, { status: 422 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const { id } = await params;
  const { data: prospectIntake } = await admin.from("project_intakes").select("id, first_name, company, email").eq("prospect_id", id).maybeSingle();
  const { data: clientIntake } = prospectIntake ? { data: null } : await admin.from("project_intakes").select("id, first_name, company, email").eq("client_id", id).maybeSingle();
  const intake = prospectIntake ?? clientIntake;
  if (!intake) return NextResponse.json({ error: "Configuration prospect introuvable." }, { status: 404 });

  if (parsed.data.action === "schedule_appointment") {
    const { data: taken } = await admin.from("project_appointments").select("id").eq("appointment_date", parsed.data.date).eq("appointment_time", parsed.data.time).eq("appointment_status", "scheduled").neq("project_intake_id", intake.id).limit(1);
    if (taken?.length) return NextResponse.json({ error: "Ce créneau est déjà pris par un autre rendez-vous." }, { status: 409 });
    const { error } = await admin.from("project_appointments").upsert({ project_intake_id: intake.id, appointment_status: "scheduled", appointment_date: parsed.data.date, appointment_time: parsed.data.time }, { onConflict: "project_intake_id" });
    if (error) { console.error("admin_appointment_schedule_failed", error.code); return NextResponse.json({ error: "Impossible d'enregistrer le rendez-vous." }, { status: 500 }); }
    await onAppointmentScheduledByAdmin({ email: intake.email, firstName: intake.first_name, company: intake.company }, parsed.data.date, parsed.data.time);
    return NextResponse.json({ ok: true, appointmentStatus: "scheduled" });
  }

  if (parsed.data.action === "complete_appointment" || parsed.data.action === "cancel_appointment") {
    const nextStatus = parsed.data.action === "complete_appointment" ? "completed" : "cancelled";
    const { data: appointment } = await admin.from("project_appointments").select("appointment_status").eq("project_intake_id", intake.id).maybeSingle();
    if (!appointment || (parsed.data.action === "complete_appointment" && appointment.appointment_status !== "scheduled")) return NextResponse.json({ error: "Le rendez-vous doit être planifié avant cette action." }, { status: 409 });
    const { error } = await admin.from("project_appointments").update({ appointment_status: nextStatus }).eq("project_intake_id", intake.id);
    if (error) return NextResponse.json({ error: "Impossible de modifier le rendez-vous." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const validationStatus = parsed.data.action === "approve" ? "approved" : parsed.data.action === "needs_information" ? "needs_information" : "declined";
  const { error } = await admin.from("project_validations").upsert({ project_intake_id: intake.id, validation_status: validationStatus, decided_at: new Date().toISOString(), decided_by: auth.user.id, internal_note: parsed.data.note || null }, { onConflict: "project_intake_id" });
  if (error) { console.error("prospect_review_save_failed", error.code); return NextResponse.json({ error: "Impossible d'enregistrer la validation." }, { status: 500 }); }
  if (validationStatus === "approved") await onPaymentRequested({ email: intake.email, firstName: intake.first_name, company: intake.company });
  return NextResponse.json({ ok: true, validationStatus });
}
