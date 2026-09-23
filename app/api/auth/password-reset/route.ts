import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site-config";
import { emailSchema } from "@/lib/validation";

const genericMessage = "Si un compte correspond à cette adresse, vous recevrez un email dans quelques instants.";

export async function POST(request: Request) {
  const parsed = emailSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Saisissez une adresse email valide." }, { status: 422 });
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Le service est momentanément indisponible." }, { status: 503 });
  const redirectTo = new URL("/auth/callback?next=/nouveau-mot-de-passe", siteUrl).toString();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo });
  if (error) console.error("password_reset_request_failed");
  return NextResponse.json({ message: genericMessage });
}
