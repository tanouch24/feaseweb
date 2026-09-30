import "server-only";

import { createHmac } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type RateLimitDecision =
  | { status: "allowed"; remaining: number; retryAfter: 0 }
  | { status: "limited"; remaining: 0; retryAfter: number }
  | { status: "unavailable"; reason: "not_configured" | "storage_error" };

type RateLimitInput = {
  category: string;
  key: string;
  limit: number;
  windowSeconds: number;
};

function hashKey(category: string, key: string) {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(`${category}:${key}`, "utf8").digest("hex");
}

export async function checkRateLimit(input: RateLimitInput): Promise<RateLimitDecision> {
  const keyHash = hashKey(input.category, input.key);
  const admin = createAdminClient();
  if (!keyHash || !admin) return { status: "unavailable", reason: !keyHash ? "not_configured" : "storage_error" };

  const { data: rawData, error } = await admin.rpc("consume_rate_limit", {
    p_category: input.category,
    p_key_hash: keyHash,
    p_limit: input.limit,
    p_window_seconds: input.windowSeconds,
  }).maybeSingle();

  const data = rawData as { allowed: boolean; remaining: number; retry_after: number } | null;
  if (error || !data) return { status: "unavailable", reason: "storage_error" };
  if (data.allowed) return { status: "allowed", remaining: data.remaining, retryAfter: 0 };
  return { status: "limited", remaining: 0, retryAfter: Math.max(1, data.retry_after) };
}

export function rateLimitResponse(retryAfter: number) {
  return Response.json(
    { error: "Trop de tentatives. Veuillez réessayer dans quelques instants." },
    { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil(retryAfter))) } },
  );
}

export function rateLimitUnavailableResponse() {
  return Response.json({ error: "Le service est momentanément indisponible. Réessayez dans quelques instants." }, { status: 503 });
}

export function getRequestIp(request: Request) {
  const netlifyIp = request.headers.get("x-nf-client-connection-ip")?.trim();
  if (netlifyIp) return netlifyIp;
  // Do not derive a public limiter key from a client-controlled forwarding
  // header. The safe fallback intentionally shares one bucket until the
  // hosting proxy exposes its trusted client-IP header.
  return "unknown";
}

export function authenticatedRateLimitKey(userId: string) {
  return `user:${userId}`;
}
