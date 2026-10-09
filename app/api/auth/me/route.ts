import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/authz";

/**
 * Rôle de la personne connectée, lu par l'en-tête du site public.
 * Le layout racine ne lit plus la session : les pages publiques restent
 * statiques (mises en cache par Netlify) au lieu d'être recalculées à
 * chaque visite.
 */
export async function GET() {
  const current = await getAuthenticatedProfile();
  return NextResponse.json({ role: current.user ? current.role : null }, { headers: { "Cache-Control": "private, no-store" } });
}
