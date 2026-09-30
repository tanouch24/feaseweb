import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { appointmentInputSchema, clientAppointmentInputSchema, mapProjectAppointment, mapProjectValidation } from "@/lib/project-review";
import { isOnboardingComplete, mapProjectIntake, onboardingProjectSelect } from "@/lib/onboarding";
import { sendMetaConversionEvent } from "@/lib/meta-conversions";
import { isBookableAppointment } from "@/lib/appointment-availability";
import { authenticatedRateLimitKey, checkRateLimit, rateLimitResponse, rateLimitUnavailableResponse } from "@/lib/rate-limit";

async function getBookingContext() {
  const current = await getAuthenticatedProfile();
  if (!current.configured) return { response: NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 }) };
  if (!current.user || (current.role !== "prospect" && current.role !== "client")) return { response: NextResponse.json({ error: "Authentification requise." }, { status: 401 }) };
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) return { response: NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 }) };
  let clientPhone: string | null = null;
  const { data: userIntake, error: userIntakeError } = await admin.from("project_intakes").select(`id, ${onboardingProjectSelect}`).eq("user_id", current.user.id).maybeSingle();
  if (userIntakeError) return { response: NextResponse.json({ error: "Projet indisponible." }, { status: 500 }) };
  if (userIntake) {
    if (current.role === "client") {
      const { data: linkedClient } = await admin.from("clients").select("phone").eq("user_id", current.user.id).maybeSingle();
      clientPhone = typeof linkedClient?.phone === "string" ? linkedClient.phone : null;
    }
    return { current, intake: userIntake, supabase, admin, clientPhone };
  }
  if (current.role === "client") {
    const { data: client, error: clientError } = await admin.from("clients").select("id, phone").eq("user_id", current.user.id).maybeSingle();
    if (clientError) return { response: NextResponse.json({ error: "Projet indisponible." }, { status: 500 }) };
    if (!client) return { response: NextResponse.json({ error: "Projet introuvable." }, { status: 404 }) };
    clientPhone = typeof client.phone === "string" ? client.phone : null;
    const { data: linkedIntake, error: linkedIntakeError } = await admin.from("project_intakes").select(`id, ${onboardingProjectSelect}`).eq("client_id", client.id).maybeSingle();
    if (linkedIntakeError) return { response: NextResponse.json({ error: "Projet indisponible." }, { status: 500 }) };
    if (!linkedIntake) return { response: NextResponse.json({ error: "Projet introuvable." }, { status: 404 }) };
    return { current, intake: linkedIntake, supabase, admin, clientPhone };
  }
  return { response: NextResponse.json({ error: "Projet introuvable." }, { status: 404 }) };
}

export async function GET(request: Request) {
  const context = await getBookingContext();
  if ("response" in context) return context.response;
  const [{ data: appointment, error: appointmentError }, { data: validation, error: validationError }] = await Promise.all([
    context.supabase.from("project_appointments").select("id, project_intake_id, appointment_status, appointment_date, appointment_time, phone, note").eq("project_intake_id", context.intake.id).maybeSingle(),
    context.admin.from("project_validations").select("id, project_intake_id, validation_status").eq("project_intake_id", context.intake.id).maybeSingle(),
  ]);
  if (appointmentError || validationError) return NextResponse.json({ error: "Rendez-vous indisponible." }, { status: 500 });
  const validationStatus = mapProjectValidation(validation).status;
  const approvalEventId = validationStatus === "approved" ? `prospect_approved:${context.intake.id}` : undefined;
  if (approvalEventId && context.current.role === "prospect") void sendMetaConversionEvent({ eventName: "prospect_approved", eventId: approvalEventId, eventSourceUrl: request.url, userData: { email: context.current.user.email } });
  return NextResponse.json({ appointment: appointment ? mapProjectAppointment(appointment) : null, validation: { status: validationStatus }, ...(approvalEventId ? { approvalEventId } : {}) });
}

export async function POST(request: Request) {
  const context = await getBookingContext();
  if ("response" in context) return context.response;
  const limit = await checkRateLimit({ category: "appointment", key: authenticatedRateLimitKey(context.current.user.id), limit: 10, windowSeconds: 3600 });
  if (limit.status === "limited") return rateLimitResponse(limit.retryAfter);
  if (limit.status === "unavailable") return rateLimitUnavailableResponse();
  const project = mapProjectIntake(context.intake);
  if (!project.completedAt || !isOnboardingComplete(project)) return NextResponse.json({ error: "Terminez votre configuration avant de planifier un appel." }, { status: 409 });
  const parsed = (context.current.role === "client" ? clientAppointmentInputSchema : appointmentInputSchema).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Les informations du rendez-vous sont invalides." }, { status: 422 });
  if (!isBookableAppointment(parsed.data.date, parsed.data.time)) return NextResponse.json({ error: "Ce créneau n'est plus disponible. Choisissez une autre date ou une autre heure." }, { status: 409 });
  const phone = context.current.role === "client" ? context.clientPhone : "phone" in parsed.data ? parsed.data.phone : null;
  const { data, error } = await context.admin.from("project_appointments").upsert({ project_intake_id: context.intake.id, appointment_status: "scheduled", appointment_date: parsed.data.date, appointment_time: parsed.data.time, phone, note: parsed.data.note || null }, { onConflict: "project_intake_id" }).select("id, project_intake_id, appointment_status, appointment_date, appointment_time, phone, note").single();
  if (error) { console.error("prospect_appointment_save_failed", error.code); return NextResponse.json({ error: "Impossible d'enregistrer votre rendez-vous." }, { status: 500 }); }
  const trackingEventId = `appointment_scheduled:${data.id}:${data.appointment_date}:${data.appointment_time}`;
  if (context.current.role === "prospect") void sendMetaConversionEvent({ eventName: "appointment_scheduled", eventId: trackingEventId, eventSourceUrl: request.url, userData: { email: context.current.user.email, phone: data.phone } });
  return NextResponse.json({ appointment: mapProjectAppointment(data), trackingEventId }, { status: 201 });
}

export async function DELETE() {
  const context = await getBookingContext();
  if ("response" in context) return context.response;
  const limit = await checkRateLimit({ category: "appointment", key: authenticatedRateLimitKey(context.current.user.id), limit: 10, windowSeconds: 3600 });
  if (limit.status === "limited") return rateLimitResponse(limit.retryAfter);
  if (limit.status === "unavailable") return rateLimitUnavailableResponse();
  const { data, error } = await context.admin.from("project_appointments").update({ appointment_status: "cancelled" }).eq("project_intake_id", context.intake.id).eq("appointment_status", "scheduled").select("id, project_intake_id, appointment_status, appointment_date, appointment_time, phone, note").maybeSingle();
  if (error) return NextResponse.json({ error: "Impossible d'annuler votre rendez-vous." }, { status: 500 });
  return NextResponse.json({ appointment: data ? mapProjectAppointment(data) : null });
}
