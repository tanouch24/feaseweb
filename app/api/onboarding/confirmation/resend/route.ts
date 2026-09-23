import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeAppUrl } from "@/lib/stripe/config";
import { emailSchema } from "@/lib/validation";

const genericMessage = "Si cette adresse correspond à un compte en attente, un nouvel email vient d'être demandé.";

export async function POST(request: Request) {
  const parsed = emailSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Saisissez une adresse email valide." }, { status: 422 });
  const supabase = await createClient();
  const appUrl = getSafeAppUrl();
  if (!supabase || !appUrl) return NextResponse.json({ error: "Le service est momentanément indisponible." }, { status: 503 });
  const { error } = await supabase.auth.resend({ type: "signup", email: parsed.data.email, options: { emailRedirectTo: `${appUrl}/auth/callback?next=/creer-mon-site` } });
  if (error) console.error("onboarding_confirmation_resend_failed");
  return NextResponse.json({ message: genericMessage });
}
