import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "client";

export async function getAuthenticatedProfile() {
  const supabase = await createClient();
  if (!supabase) return { configured: false as const, user: null, role: null };
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { configured: true as const, user: null, role: null };
  const { data: profile } = await supabase.from("profiles").select("id, role, first_name, last_name, email").eq("id", user.id).maybeSingle();
  return { configured: true as const, user, role: (profile?.role as Role | null) ?? null, profile };
}

export async function requireAdmin() {
  const current = await getAuthenticatedProfile();
  if (!current.configured) redirect("/connexion?reason=configuration");
  if (!current.user) redirect("/connexion");
  if (current.role !== "admin") redirect("/espace-client?reason=forbidden");
  return current;
}

export async function requireClient() {
  const current = await getAuthenticatedProfile();
  if (!current.configured) redirect("/connexion?reason=configuration");
  if (!current.user) redirect("/connexion");
  if (current.role === "admin") redirect("/admin");
  if (current.role !== "client") redirect("/connexion?reason=role");
  return current;
}

export async function requireApiAdmin() {
  const current = await getAuthenticatedProfile();
  if (!current.configured) return { response: NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 503 }) };
  if (!current.user) return { response: NextResponse.json({ error: "Authentification requise." }, { status: 401 }) };
  if (current.role !== "admin") return { response: NextResponse.json({ error: "Accès interdit." }, { status: 403 }) };
  return { user: current.user };
}
