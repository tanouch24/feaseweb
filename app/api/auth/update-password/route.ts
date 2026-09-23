import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/authz";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { passwordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const current = await getAuthenticatedProfile();
  if (!current.configured) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  if (!current.user) return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 401 });
  if (current.role !== "client" && current.role !== "admin" && current.role !== "prospect") return NextResponse.json({ error: "Ce compte n'a pas de rôle FeaseWeb valide." }, { status: 403 });
  const parsed = passwordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Mot de passe invalide." }, { status: 422 });
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return NextResponse.json({ error: "Impossible d'enregistrer le mot de passe." }, { status: 400 });
  if (current.role === "client") {
    const admin = createAdminClient();
    if (admin) await admin.from("clients").update({ access_status: "actif", activated_at: new Date().toISOString() }).eq("user_id", current.user.id);
  }
  return NextResponse.json({ redirect: current.role === "admin" ? "/admin" : "/espace-client" });
}
