import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { sitePatchSchema } from "@/lib/validation";
import { sendClientUpdateEmail } from "@/lib/brevo";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin(); if ("response" in auth) return auth.response;
  const supabase = await createClient(); if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const parsed = sitePatchSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Données site invalides." }, { status: 422 });
  const { id } = await params;
  const { data: before } = await supabase.from("sites").select("id, client_id, status").eq("id", id).maybeSingle();
  if (!before) return NextResponse.json({ error: "Site introuvable." }, { status: 404 });
  const patch = { preview_url: parsed.data.previewUrl, production_url: parsed.data.productionUrl, domain: parsed.data.domain, repository: parsed.data.repository, hosting_provider: parsed.data.hostingProvider, status: parsed.data.status, launched_at: parsed.data.status === "actif" ? new Date().toISOString() : undefined };
  const { error } = await supabase.from("sites").update(patch).eq("id", id); if (error) return NextResponse.json({ error: "Impossible de modifier le site." }, { status: 500 });
  if (parsed.data.status === "actif" && before.status !== "actif" && before.client_id) {
    const idempotencyKey = id;
    const { data: existing } = await supabase.from("client_updates").select("id").eq("client_id", before.client_id).eq("idempotency_key", idempotencyKey).maybeSingle();
    if (!existing) {
      const { data: client } = await supabase.from("clients").select("id, email, first_name").eq("id", before.client_id).maybeSingle();
      const { data: update } = await supabase.from("client_updates").insert({ client_id: before.client_id, site_id: id, category: "site", update_type: "mise_en_ligne", action_type: "voir_projet", title: "Votre site est en ligne", description: "Votre site internet est maintenant disponible.", status: "termine", visible_to_client: true, activity_date: new Date().toISOString().slice(0, 10), created_by: auth.user.id, idempotency_key: idempotencyKey }).select("id").maybeSingle();
      if (update && client?.email) {
        const email = await sendClientUpdateEmail({ firstName: client.first_name, email: client.email, updateType: "mise_en_ligne", title: "Votre site est en ligne", message: "Votre site internet est maintenant disponible." });
        await supabase.from("client_updates").update(email.ok ? { notification_status: "sent", notification_sent_at: new Date().toISOString() } : { notification_status: "failed", notification_error: email.reason }).eq("id", update.id);
      }
    }
  }
  await supabase.from("activity_log").insert({ actor_id: auth.user.id, entity_type: "site", entity_id: id, message: "Site modifié." }); return NextResponse.json({ ok: true });
}
