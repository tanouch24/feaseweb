import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/config";
import { validateRequestOrigin } from "@/lib/request-origin";

const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const stripeWebhookPath = "/api/stripe/webhook";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    if (mutatingMethods.has(request.method) && request.nextUrl.pathname !== stripeWebhookPath) {
      const originResponse = validateRequestOrigin(request);
      if (originResponse) return originResponse;
    }
    return NextResponse.next();
  }
  if (!isSupabaseConfigured()) return NextResponse.next();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl!, supabasePublishableKey!, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = { matcher: ["/api/:path*", "/admin/:path*", "/espace-client/:path*", "/connexion"] };
