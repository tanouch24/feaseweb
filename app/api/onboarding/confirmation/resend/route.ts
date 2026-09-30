import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeAppUrl } from "@/lib/stripe/config";
import { emailSchema } from "@/lib/validation";
import { checkRateLimit, getRequestIp, rateLimitResponse, rateLimitUnavailableResponse } from "@/lib/rate-limit";

const genericMessage = "Si cette adresse correspond à un compte en attente, un nouvel email vient d'être demandé.";

export async function POST(request: Request) {
  const parsed = emailSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Saisissez une adresse email valide." }, { status: 422 });
  const limit = await checkRateLimit({ category: "confirmation-resend", key: getRequestIp(request), limit: 3, windowSeconds: 900 });
  if (limit.status === "limited") return rateLimitResponse(limit.retryAfter);
  if (limit.status === "unavailable") return rateLimitUnavailableResponse();
  const supabase = await createClient();
  const appUrl = getSafeAppUrl();
  if (!supabase || !appUrl) return NextResponse.json({ error: "Le service est momentanément indisponible." }, { status: 503 });
  const { error } = await supabase.auth.resend({ type: "signup", email: parsed.data.email, options: { emailRedirectTo: `${appUrl}/auth/callback?next=/creer-mon-site` } });
  if (error) {
    console.error("onboarding_confirmation_resend_failed");
    return NextResponse.json({ error: "Impossible de renvoyer l'email pour le moment. Réessayez dans quelques instants." }, { status: 502 });
  }
  return NextResponse.json({ message: genericMessage });
}
