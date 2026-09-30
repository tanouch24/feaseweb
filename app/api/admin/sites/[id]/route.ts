import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { sitePatchSchema } from "@/lib/validation";
import { sendClientUpdateEmail } from "@/lib/brevo";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin(); if ("response" in auth) return auth.response;
  const supabase = createAdminClient(); if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const parsed = sitePatchSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Données site invalides." }, { status: 422 });
  const { id } = await params;
  const { data: before } = await supabase.from("sites").select("id, client_id, project_intake_id, status").eq("id", id).maybeSingle();
  if (!before) return NextResponse.json({ error: "Site introuvable." }, { status: 404 });
  const patch: Record<string, unknown> = {};
  if (parsed.data.previewUrl !== undefined) patch.preview_url = parsed.data.previewUrl;
  if (parsed.data.productionUrl !== undefined) patch.production_url = parsed.data.productionUrl;
  if (parsed.data.domain !== undefined) patch.domain = parsed.data.domain;
  if (parsed.data.repository !== undefined) patch.repository = parsed.data.repository;
  if (parsed.data.hostingProvider !== undefined) patch.hosting_provider = parsed.data.hostingProvider;
  if (parsed.data.status !== undefined) {
    patch.status = parsed.data.status;
    if (parsed.data.status === "actif") patch.launched_at = new Date().toISOString();
  }
  const { data: saved, error } = await supabase.from("sites").update(patch).eq("id", id).select("id, project_intake_id, client_id, domain, production_url, status, launched_at").single();
  if (error || !saved) return NextResponse.json({ error: "Impossible de modifier le site." }, { status: 500 });
  if (parsed.data.status === "actif" && before.status !== "actif") {
    const idempotencyKey = id;
    const { data: existing } = await supabase.from("client_updates").select("id").eq("idempotency_key", idempotencyKey).maybeSingle();
    if (!existing) {
      const { data: intake } = before.project_intake_id
        ? await supabase.from("project_intakes").select("id, client_id, email, first_name").eq("id", before.project_intake_id).maybeSingle()
        : before.client_id
          ? await supabase.from("project_intakes").select("id, client_id, email, first_name").eq("client_id", before.client_id).maybeSingle()
          : { data: null };
      const { data: client } = before.client_id ? await supabase.from("clients").select("id, email, first_name").eq("id", before.client_id).maybeSingle() : { data: null };
      const { data: update } = await supabase.from("client_updates").insert({ client_id: before.client_id, project_intake_id: before.project_intake_id ?? intake?.id ?? null, site_id: id, category: "site", update_type: "mise_en_ligne", action_type: "voir_projet", title: "Votre site est en ligne", description: "Votre site internet est maintenant disponible.", status: "termine", visible_to_client: true, activity_date: new Date().toISOString().slice(0, 10), created_by: auth.user.id, idempotency_key: idempotencyKey }).select("id").maybeSingle();
      if (update && client?.email) {
        const email = await sendClientUpdateEmail({ firstName: client.first_name, email: client.email, updateType: "mise_en_ligne", title: "Votre site est en ligne", message: "Votre site internet est maintenant disponible." });
        await supabase.from("client_updates").update(email.ok ? { notification_status: "sent", notification_sent_at: new Date().toISOString() } : { notification_status: "failed", notification_error: email.reason }).eq("id", update.id);
      } else if (update && intake?.email) {
        const email = await sendClientUpdateEmail({ firstName: intake.first_name, email: intake.email, updateType: "mise_en_ligne", title: "Votre site est en ligne", message: "Votre site internet est maintenant disponible." });
        await supabase.from("client_updates").update(email.ok ? { notification_status: "sent", notification_sent_at: new Date().toISOString() } : { notification_status: "failed", notification_error: email.reason }).eq("id", update.id);
      }
    }
  }
  await supabase.from("activity_log").insert({ actor_id: auth.user.id, entity_type: "site", entity_id: id, message: "Site modifié." }); return NextResponse.json({ ok: true, site: saved });
}
