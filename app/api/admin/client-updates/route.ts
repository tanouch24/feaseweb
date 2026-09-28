import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { sendClientUpdateEmail } from "@/lib/brevo";
import { createClient } from "@/lib/supabase/server";
import { clientUpdateSchema } from "@/lib/validation";

const emailFailureMessage = "Mise à jour publiée, mais l'email n'a pas pu être envoyé.";
type UpdateRow = { id: string; client_id: string; notification_status: "pending" | "sending" | "sent" | "failed"; update_type: string; title: string; description: string };
type ClientRow = { id: string; email: string; first_name: string | null; last_name: string | null };

async function notifyUpdate(supabase: Awaited<ReturnType<typeof createClient>>, update: UpdateRow, client: ClientRow) {
  if (!supabase) return { emailSent: false, warning: emailFailureMessage };
  if (update.notification_status === "sent") return { emailSent: true };
  const { data: claim, error: claimError } = await supabase.from("client_updates").update({ notification_status: "sending", notification_error: null }).eq("id", update.id).in("notification_status", ["pending", "failed"]).select("id").maybeSingle();
  if (claimError) { console.error("client_update_notification_claim_failed", claimError.code); return { emailSent: false, warning: emailFailureMessage }; }
  if (!claim) {
    const { data: current } = await supabase.from("client_updates").select("notification_status").eq("id", update.id).maybeSingle();
    return current?.notification_status === "sent" ? { emailSent: true } : { emailSent: false, warning: emailFailureMessage };
  }
  const result = await sendClientUpdateEmail({ firstName: client.first_name, email: client.email, updateType: update.update_type, title: update.title, message: update.description });
  if (result.ok) {
    const { error } = await supabase.from("client_updates").update({ notification_status: "sent", notification_sent_at: new Date().toISOString(), notification_error: null }).eq("id", update.id);
    if (error) console.error("client_update_notification_state_failed", error.code);
    return { emailSent: true };
  }
  const { error } = await supabase.from("client_updates").update({ notification_status: "failed", notification_error: result.reason }).eq("id", update.id);
  if (error) console.error("client_update_notification_failure_state_failed", error.code);
  return { emailSent: false, warning: emailFailureMessage };
}

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) return NextResponse.json({ error: "Clé de publication invalide." }, { status: 422 });
  const parsed = clientUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Mise à jour invalide." }, { status: 422 });
  const { data: client } = await supabase.from("clients").select("id, email, first_name, last_name").eq("id", parsed.data.client_id).maybeSingle() as { data: ClientRow | null };
  if (!client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
  if (parsed.data.site_id) {
    const { data: site } = await supabase.from("sites").select("id").eq("id", parsed.data.site_id).eq("client_id", parsed.data.client_id).maybeSingle();
    if (!site) return NextResponse.json({ error: "Site invalide pour ce client." }, { status: 422 });
  }
  const { data: duplicate } = await supabase.from("client_updates").select("id, client_id, notification_status, update_type, title, description").eq("created_by", auth.user.id).eq("idempotency_key", idempotencyKey).maybeSingle() as { data: UpdateRow | null };
  if (duplicate && duplicate.client_id !== parsed.data.client_id) return NextResponse.json({ error: "Clé de publication déjà utilisée." }, { status: 409 });
  let update = duplicate;
  if (!update) {
    const { data: created, error } = await supabase.from("client_updates").insert({ ...parsed.data, idempotency_key: idempotencyKey, created_by: auth.user.id }).select("id, client_id, notification_status, update_type, title, description").single() as { data: UpdateRow | null; error: { code?: string } | null };
    if (error || !created) {
      if (error?.code === "23505") {
        const retry = await supabase.from("client_updates").select("id, client_id, notification_status, update_type, title, description").eq("created_by", auth.user.id).eq("idempotency_key", idempotencyKey).maybeSingle() as { data: UpdateRow | null };
        update = retry.data;
      }
      if (!update) { console.error("client_update_create_failed", error?.code ?? "unknown"); return NextResponse.json({ error: "Impossible d'enregistrer la mise à jour." }, { status: 500 }); }
    } else update = created;
    if (!duplicate && update) await supabase.from("activity_log").insert({ actor_id: auth.user.id, entity_type: "client_update", entity_id: update.id, message: "Mise à jour client créée." });
  }
  if (!update) return NextResponse.json({ error: "Impossible de retrouver la mise à jour." }, { status: 500 });
  const notification = await notifyUpdate(supabase, update, client);
  return NextResponse.json({ ok: true, id: update.id, emailSent: notification.emailSent, ...(notification.warning ? { warning: notification.warning } : {}) });
}
