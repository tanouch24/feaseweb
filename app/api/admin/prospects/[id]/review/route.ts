import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminReviewSchema } from "@/lib/project-review";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  const parsed = adminReviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Action de validation invalide." }, { status: 422 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const { id } = await params;
  const { data: intake } = await admin.from("project_intakes").select("id").eq("prospect_id", id).maybeSingle();
  if (!intake) return NextResponse.json({ error: "Configuration prospect introuvable." }, { status: 404 });

  if (parsed.data.action === "complete_appointment" || parsed.data.action === "cancel_appointment") {
    const nextStatus = parsed.data.action === "complete_appointment" ? "completed" : "cancelled";
    const { data: appointment } = await admin.from("project_appointments").select("appointment_status").eq("project_intake_id", intake.id).maybeSingle();
    if (!appointment || (parsed.data.action === "complete_appointment" && appointment.appointment_status !== "scheduled")) return NextResponse.json({ error: "Le rendez-vous doit être planifié avant cette action." }, { status: 409 });
    const { error } = await admin.from("project_appointments").update({ appointment_status: nextStatus }).eq("project_intake_id", intake.id);
    if (error) return NextResponse.json({ error: "Impossible de modifier le rendez-vous." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "approve") {
    const { data: appointment } = await admin.from("project_appointments").select("appointment_status").eq("project_intake_id", intake.id).maybeSingle();
    if (appointment?.appointment_status !== "completed") return NextResponse.json({ error: "Marquez d'abord le rendez-vous comme réalisé." }, { status: 409 });
  }
  const validationStatus = parsed.data.action === "approve" ? "approved" : parsed.data.action === "needs_information" ? "needs_information" : "declined";
  const { error } = await admin.from("project_validations").upsert({ project_intake_id: intake.id, validation_status: validationStatus, decided_at: new Date().toISOString(), decided_by: auth.user.id, internal_note: parsed.data.note || null }, { onConflict: "project_intake_id" });
  if (error) { console.error("prospect_review_save_failed", error.code); return NextResponse.json({ error: "Impossible d'enregistrer la validation." }, { status: 500 }); }
  return NextResponse.json({ ok: true, validationStatus });
}
