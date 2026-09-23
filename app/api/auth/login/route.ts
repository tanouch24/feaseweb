import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Email ou mot de passe invalide." }, { status: 422 });
  const { data: authData, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !authData.user) return NextResponse.json({ error: "Email ou mot de passe incorrect." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (profile?.role !== "admin" && profile?.role !== "client" && profile?.role !== "prospect") {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Ce compte n'a pas de rôle FeaseWeb valide." }, { status: 403 });
  }
  return NextResponse.json({ redirect: profile?.role === "admin" ? "/admin" : "/espace-client" });
}
