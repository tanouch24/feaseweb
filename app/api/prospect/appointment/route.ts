import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { appointmentInputSchema, mapProjectAppointment, mapProjectValidation } from "@/lib/project-review";
import { isOnboardingComplete, mapProjectIntake, onboardingProjectSelect } from "@/lib/onboarding";
import { sendMetaConversionEvent } from "@/lib/meta-conversions";

async function getProspectContext() {
  const current = await getAuthenticatedProfile();
  if (!current.configured) return { response: NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 }) };
  if (!current.user || current.role !== "prospect") return { response: NextResponse.json({ error: "Accès réservé aux prospects." }, { status: 403 }) };
  const supabase = await createClient();
  if (!supabase) return { response: NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 }) };
  const { data: intake, error } = await supabase.from("project_intakes").select(`id, ${onboardingProjectSelect}`).eq("user_id", current.user.id).maybeSingle();
  if (error) return { response: NextResponse.json({ error: "Projet indisponible." }, { status: 500 }) };
  if (!intake) return { response: NextResponse.json({ error: "Projet introuvable." }, { status: 404 }) };
  return { current, intake, supabase };
}

export async function GET(request: Request) {
  const context = await getProspectContext();
  if ("response" in context) return context.response;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  const [{ data: appointment, error: appointmentError }, { data: validation, error: validationError }] = await Promise.all([
    context.supabase.from("project_appointments").select("id, project_intake_id, appointment_status, appointment_date, appointment_time, phone, note").eq("project_intake_id", context.intake.id).maybeSingle(),
    admin.from("project_validations").select("id, project_intake_id, validation_status").eq("project_intake_id", context.intake.id).maybeSingle(),
  ]);
  if (appointmentError || validationError) return NextResponse.json({ error: "Rendez-vous indisponible." }, { status: 500 });
  const validationStatus = mapProjectValidation(validation).status;
  const approvalEventId = validationStatus === "approved" ? `prospect_approved:${context.intake.id}` : undefined;
  if (approvalEventId) void sendMetaConversionEvent({ eventName: "prospect_approved", eventId: approvalEventId, eventSourceUrl: request.url, userData: { email: context.current.user.email } });
  return NextResponse.json({ appointment: appointment ? mapProjectAppointment(appointment) : null, validation: { status: validationStatus }, ...(approvalEventId ? { approvalEventId } : {}) });
}

export async function POST(request: Request) {
  const context = await getProspectContext();
  if ("response" in context) return context.response;
  const project = mapProjectIntake(context.intake);
  if (!project.completedAt || !isOnboardingComplete(project)) return NextResponse.json({ error: "Terminez votre configuration avant de planifier un appel." }, { status: 409 });
  const parsed = appointmentInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Les informations du rendez-vous sont invalides." }, { status: 422 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  const { data, error } = await admin.from("project_appointments").upsert({ project_intake_id: context.intake.id, appointment_status: "scheduled", appointment_date: parsed.data.date, appointment_time: parsed.data.time, phone: parsed.data.phone, note: parsed.data.note || null }, { onConflict: "project_intake_id" }).select("id, project_intake_id, appointment_status, appointment_date, appointment_time, phone, note").single();
  if (error) { console.error("prospect_appointment_save_failed", error.code); return NextResponse.json({ error: "Impossible d'enregistrer votre rendez-vous." }, { status: 500 }); }
  const trackingEventId = `appointment_scheduled:${data.id}:${data.appointment_date}:${data.appointment_time}`;
  void sendMetaConversionEvent({ eventName: "appointment_scheduled", eventId: trackingEventId, eventSourceUrl: request.url, userData: { email: context.current.user.email, phone: data.phone } });
  return NextResponse.json({ appointment: mapProjectAppointment(data), trackingEventId }, { status: 201 });
}

export async function DELETE() {
  const context = await getProspectContext();
  if ("response" in context) return context.response;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  const { data, error } = await admin.from("project_appointments").update({ appointment_status: "cancelled" }).eq("project_intake_id", context.intake.id).eq("appointment_status", "scheduled").select("id, project_intake_id, appointment_status, appointment_date, appointment_time, phone, note").maybeSingle();
  if (error) return NextResponse.json({ error: "Impossible d'annuler votre rendez-vous." }, { status: 500 });
  return NextResponse.json({ appointment: data ? mapProjectAppointment(data) : null });
}
