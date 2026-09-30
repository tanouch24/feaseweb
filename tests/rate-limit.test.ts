import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");
const migration = source("supabase/migrations/20260930150000_distributed_rate_limits.sql");
const helper = source("lib/rate-limit.ts");

describe("distributed rate limiting", () => {
  it("RATE_LIMIT_FIRST_REQUEST_ALLOWED", () => {
    expect(migration).toContain("request_count, window_started_at, expires_at");
    expect(migration).toContain("return query select true, p_limit - 1, 0");
  });

  it("RATE_LIMIT_WITHIN_LIMIT_ALLOWED", () => {
    expect(migration).toContain("request_count = request_count + 1");
    expect(migration).toContain("greatest(0, p_limit - current_bucket.request_count - 1)");
  });

  it("RATE_LIMIT_EXCEEDED_429", () => {
    expect(helper).toContain('status: 429');
    expect(helper).toContain('"Retry-After"');
  });

  it("RATE_LIMIT_RETRY_AFTER", () => {
    expect(migration).toContain("ceil(extract(epoch from (current_bucket.expires_at - current_time)))");
    expect(helper).toContain("retryAfter");
  });

  it("RATE_LIMIT_DIFFERENT_USER_ALLOWED", () => {
    expect(helper).toContain("createHmac(\"sha256\"");
    expect(helper).toContain("category}:${key}");
  });

  it("RATE_LIMIT_DIFFERENT_IP_ALLOWED", () => {
    expect(helper).toContain("x-nf-client-connection-ip");
  });

  it("RATE_LIMIT_WINDOW_RESET", () => {
    expect(migration).toContain("current_bucket.expires_at <= current_time");
    expect(migration).toContain("request_count = 1");
  });

  it("RATE_LIMIT_MULTI_INSTANCE_SHARED", () => {
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("security definer");
  });

  it("RATE_LIMIT_NO_PII_KEY", () => {
    expect(helper).toContain('createHmac("sha256"');
    expect(migration).toContain("key_hash text not null");
    expect(migration).not.toContain("email text");
    expect(migration).not.toContain("ip_address text");
  });

  it("RATE_LIMIT_PROSPECT", () => expect(source("app/api/prospects/route.ts")).toContain('category: "prospect"'));
  it("RATE_LIMIT_PASSWORD_RESET", () => expect(source("app/api/auth/password-reset/route.ts")).toContain('category: "password-reset"'));
  it("RATE_LIMIT_RESEND", () => expect(source("app/api/onboarding/confirmation/resend/route.ts")).toContain('category: "confirmation-resend"'));
  it("RATE_LIMIT_ACCOUNT", () => expect(source("app/api/onboarding/account/route.ts")).toContain('category: "account"'));
  it("RATE_LIMIT_MESSAGES", () => expect(source("app/api/onboarding/support/route.ts")).toContain('category: "support"'));
  it("RATE_LIMIT_CLIENT_REQUEST", () => expect(source("app/api/client/requests/route.ts")).toContain('category: "client-request"'));
  it("RATE_LIMIT_APPOINTMENT", () => expect(source("app/api/prospect/appointment/route.ts")).toContain('category: "appointment"'));
  it("RATE_LIMIT_CHECKOUT", () => expect(source("app/api/billing/checkout/route.ts")).toContain('category: "checkout"'));
  it("RATE_LIMIT_PORTAL", () => expect(source("app/api/billing/portal/route.ts")).toContain('category: "portal"'));

  it("RATE_LIMIT_FAILURE_503", () => expect(helper).toContain("status: 503"));

  it("RATE_LIMIT_ANON_TABLE_ACCESS_BLOCKED", () => {
    expect(migration).toContain("revoke all on table public.rate_limit_buckets from anon, authenticated");
  });

  it("RATE_LIMIT_AUTH_TABLE_ACCESS_BLOCKED", () => {
    expect(migration).toContain("enable row level security");
  });

  it("STRIPE_WEBHOOK_NOT_RATE_LIMITED", () => {
    expect(source("app/api/stripe/webhook/route.ts")).not.toContain("checkRateLimit");
  });

  it("LOGIN_NATIVE_SUPABASE_LIMIT_PRESERVED", () => {
    const login = source("app/api/auth/login/route.ts");
    expect(login).toContain("signInWithPassword");
    expect(login).not.toContain("checkRateLimit");
  });
});
