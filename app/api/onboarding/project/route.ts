import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedProfile } from "@/lib/authz";
import { onboardingPatchSchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const current = await getAuthenticatedProfile();
  if (!current.configured) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  if (!current.user || (current.role !== "prospect" && current.role !== "client")) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const supabase = await createClient();
  const { data, error } = await supabase!.from("project_intakes").select("*").eq("user_id", current.user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "Projet indisponible." }, { status: 500 });
  return NextResponse.json({ project: data });
}

export async function PATCH(request: Request) {
  const current = await getAuthenticatedProfile();
  if (!current.configured) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  if (!current.user || (current.role !== "prospect" && current.role !== "client")) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const parsed = onboardingPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Informations invalides." }, { status: 422 });
  const supabase = await createClient();
  const payload = Object.fromEntries(Object.entries(parsed.data).map(([key, value]) => [({ firstName: "first_name", lastName: "last_name", hasExistingSite: "has_existing_site", existingSiteUrl: "existing_site_url", existingSiteProject: "existing_site_project", primaryObjective: "primary_objective", requestedPages: "requested_pages", styleDirection: "style_direction", colorMood: "color_mood", availableAssets: "available_assets", contactChannel: "contact_channel", contactSlot: "contact_slot", currentStep: "current_step" } as Record<string, string>)[key] ?? key, value]));
  if (payload.has_existing_site === false) { payload.existing_site_url = null; payload.existing_site_project = null; }
  if (Array.isArray(payload.available_assets) && (payload.available_assets as string[]).includes("aucun")) payload.available_assets = ["aucun"];
  const { data, error } = await supabase!.from("project_intakes").update(payload).eq("user_id", current.user.id).select("*").single();
  if (error) return NextResponse.json({ error: "Impossible d'enregistrer le projet." }, { status: 400 });
  let result = data;
  if (data.current_step === 8 && data.activity && data.primary_objective && data.style_direction && data.color_mood && data.contact_channel && data.contact_slot && data.requested_pages?.length && data.available_assets?.length) {
    const admin = createAdminClient();
    if (admin) {
      const completed = await admin.from("project_intakes").update({ completed_at: new Date().toISOString(), project_status: "project_configured" }).eq("id", data.id).select("*").single();
      if (!completed.error && completed.data) result = completed.data;
    }
  }
  return NextResponse.json({ project: result });
}
