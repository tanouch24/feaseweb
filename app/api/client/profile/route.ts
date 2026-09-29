import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { profileUpdateSchema } from "@/lib/validation";

async function context() {
  const current = await getAuthenticatedProfile();
  if (!current.user || (current.role !== "prospect" && current.role !== "client")) return null;
  const admin = createAdminClient();
  if (!admin) return null;
  const { data: intake } = await admin.from("project_intakes").select("id, prospect_id, client_id, first_name, last_name, company, email, phone").eq("user_id", current.user.id).maybeSingle();
  const { data: client } = await admin.from("clients").select("id, prospect_id, first_name, last_name, company, email, phone").eq("user_id", current.user.id).maybeSingle();
  return { current, admin, intake, client };
}

export async function GET() {
  const value = await context();
  if (!value) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const source = value.intake ?? value.client;
  return NextResponse.json({ profile: { firstName: source?.first_name ?? value.current.profile?.first_name ?? "", lastName: source?.last_name ?? value.current.profile?.last_name ?? "", company: source?.company ?? "", phone: source?.phone ?? "", email: value.current.user.email ?? source?.email ?? "" } });
}

export async function PATCH(request: Request) {
  const value = await context();
  if (!value) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const parsed = profileUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Informations invalides." }, { status: 422 });
  const next = { first_name: parsed.data.firstName, last_name: parsed.data.lastName, company: parsed.data.company, phone: parsed.data.phone ?? "" };
  if (value.intake) {
    const { error } = await value.admin.from("project_intakes").update(next).eq("id", value.intake.id).eq("user_id", value.current.user.id);
    if (error) return NextResponse.json({ error: "Impossible d'enregistrer vos informations." }, { status: 500 });
    if (value.intake.prospect_id) await value.admin.from("prospects").update(next).eq("id", value.intake.prospect_id);
    if (value.intake.client_id) await value.admin.from("clients").update(next).eq("id", value.intake.client_id);
  } else if (value.client) {
    const { error } = await value.admin.from("clients").update(next).eq("id", value.client.id).eq("user_id", value.current.user.id);
    if (error) return NextResponse.json({ error: "Impossible d'enregistrer vos informations." }, { status: 500 });
  } else {
    return NextResponse.json({ error: "Aucun projet n'est associé à ce compte." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
