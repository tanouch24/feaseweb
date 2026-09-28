import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { setAdminSessionCookie } from "@/lib/admin-session";

export async function POST() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  return setAdminSessionCookie(NextResponse.json({ redirect: "/connexion" }), true);
}
