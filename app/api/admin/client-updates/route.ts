import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { sendClientUpdateEmail } from "@/lib/brevo";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientUpdateSchema } from "@/lib/validation";

const emailFailureMessage = "Mise à jour publiée, mais l'email n'a pas pu être envoyé.";
type UpdateRow = { id: string; client_id: string | null; project_intake_id: string | null; notification_status: "pending" | "sending" | "sent" | "failed"; update_type: string; title: string; description: string };
type Recipient = { email: string | null; first_name: string | null };

async function notifyUpdate(admin: NonNullable<ReturnType<typeof createAdminClient>>, update: UpdateRow, recipient: Recipient) {
  if (update.notification_status === "sent") return { emailSent: true };
  const { data: claim, error: claimError } = await admin.from("client_updates").update({ notification_status: "sending", notification_error: null }).eq("id", update.id).in("notification_status", ["pending", "failed"]).select("id").maybeSingle();
  if (claimError) { console.error("client_update_notification_claim_failed", claimError.code); return { emailSent: false, warning: emailFailureMessage }; }
  if (!claim) {
    const { data: current } = await admin.from("client_updates").select("notification_status").eq("id", update.id).maybeSingle();
    return current?.notification_status === "sent" ? { emailSent: true } : { emailSent: false, warning: emailFailureMessage };
  }
  if (!recipient.email) return { emailSent: false, warning: emailFailureMessage };
  const result = await sendClientUpdateEmail({ firstName: recipient.first_name, email: recipient.email, updateType: update.update_type, title: update.title, message: update.description });
  if (result.ok) {
    await admin.from("client_updates").update({ notification_status: "sent", notification_sent_at: new Date().toISOString(), notification_error: null }).eq("id", update.id);
    return { emailSent: true };
  }
  await admin.from("client_updates").update({ notification_status: "failed", notification_error: result.reason }).eq("id", update.id);
  return { emailSent: false, warning: emailFailureMessage };
}

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) return NextResponse.json({ error: "Clé de publication invalide." }, { status: 422 });
  const parsed = clientUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Mise à jour invalide." }, { status: 422 });
  const normalized = "update_type" in parsed.data ? parsed.data : { ...parsed.data, update_type: "information" as const, action_type: null, category: parsed.data.category, status: parsed.data.status, visible_to_client: parsed.data.visible_to_client };

  const requestedClientId = parsed.data.client_id;
  const requestedIntakeId = parsed.data.project_intake_id;
  const { data: intake } = requestedIntakeId
    ? await admin.from("project_intakes").select("id, client_id, email, first_name").eq("id", requestedIntakeId).maybeSingle()
    : requestedClientId
      ? await admin.from("project_intakes").select("id, client_id, email, first_name").eq("client_id", requestedClientId).maybeSingle()
      : { data: null };
  if (requestedClientId && intake?.client_id && intake.client_id !== requestedClientId) return NextResponse.json({ error: "Le client ne correspond pas au dossier." }, { status: 422 });
  const clientId = requestedClientId ?? intake?.client_id ?? null;
  const { data: client } = clientId ? await admin.from("clients").select("id, email, first_name").eq("id", clientId).maybeSingle() : { data: null };
  if (!intake && !client) return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });
  if (parsed.data.site_id) {
    const { data: site } = await admin.from("sites").select("id, client_id, project_intake_id").eq("id", parsed.data.site_id).maybeSingle();
    const siteBelongs = site && ((intake && site.project_intake_id === intake.id) || (clientId && site.client_id === clientId));
    if (!siteBelongs) return NextResponse.json({ error: "Site invalide pour ce dossier." }, { status: 422 });
  }
  const { data: duplicate } = await admin.from("client_updates").select("id, client_id, project_intake_id, notification_status, update_type, title, description").eq("created_by", auth.user.id).eq("idempotency_key", idempotencyKey).maybeSingle() as { data: UpdateRow | null };
  if (duplicate && duplicate.project_intake_id !== (intake?.id ?? null) && duplicate.client_id !== clientId) return NextResponse.json({ error: "Clé de publication déjà utilisée." }, { status: 409 });
  let update = duplicate;
  if (!update) {
    const { data: created, error } = await admin.from("client_updates").insert({ client_id: clientId, project_intake_id: intake?.id ?? null, site_id: normalized.site_id, update_type: normalized.update_type, action_type: normalized.action_type, title: normalized.title, description: normalized.description, category: normalized.category, status: normalized.status, visible_to_client: normalized.visible_to_client, activity_date: normalized.activity_date, idempotency_key: idempotencyKey, created_by: auth.user.id }).select("id, client_id, project_intake_id, notification_status, update_type, title, description").single() as { data: UpdateRow | null; error: { code?: string } | null };
    if (error || !created) {
      if (error?.code === "23505") {
        const retry = await admin.from("client_updates").select("id, client_id, project_intake_id, notification_status, update_type, title, description").eq("created_by", auth.user.id).eq("idempotency_key", idempotencyKey).maybeSingle() as { data: UpdateRow | null };
        update = retry.data;
      }
      if (!update) { console.error("client_update_create_failed", error?.code ?? "unknown"); return NextResponse.json({ error: "Impossible d'enregistrer la mise à jour." }, { status: 500 }); }
    } else update = created;
    if (!duplicate && update) await admin.from("activity_log").insert({ actor_id: auth.user.id, entity_type: "client_update", entity_id: update.id, message: "Mise à jour client créée." });
  }
  if (!update) return NextResponse.json({ error: "Impossible de retrouver la mise à jour." }, { status: 500 });
  const notification = await notifyUpdate(admin, update, { email: client?.email ?? intake?.email ?? null, first_name: client?.first_name ?? intake?.first_name ?? null });
  return NextResponse.json({ ok: true, id: update.id, emailSent: notification.emailSent, ...(notification.warning ? { warning: notification.warning } : {}) });
}
