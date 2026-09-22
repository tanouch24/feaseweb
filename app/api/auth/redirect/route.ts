import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/authz";

export async function GET(request: Request) {
  const current = await getAuthenticatedProfile();
  if (!current.configured || !current.user) return NextResponse.redirect(new URL("/connexion", request.url));
  return NextResponse.redirect(new URL(current.role === "admin" ? "/admin" : "/espace-client", request.url));
}
