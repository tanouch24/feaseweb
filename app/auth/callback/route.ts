import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedDestinations = new Set(["/activation-compte", "/nouveau-mot-de-passe", "/creer-mon-site"]);

function destination(request: Request) {
  const next = new URL(request.url).searchParams.get("next") ?? "/connexion";
  return allowedDestinations.has(next) ? next : "/connexion";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = destination(request);
  const supabase = await createClient();
  if (!code || !supabase) return NextResponse.redirect(new URL(`${next}?error=invalid_link`, request.url));
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL(`${next}?error=invalid_link`, request.url));
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();
  if (user && admin) {
    if (next === "/creer-mon-site") {
      const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profile?.role !== "prospect") return NextResponse.redirect(new URL("/connexion?error=invalid_link", request.url));
    }
    if (next !== "/creer-mon-site") await admin.from("clients").update({ access_status: "actif", activated_at: new Date().toISOString() }).eq("user_id", user.id);
  }
  return NextResponse.redirect(new URL(next, request.url));
}
