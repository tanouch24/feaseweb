import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("V9 prospect review gate", () => {
  it("defines isolated appointment and admin-only validation storage", () => {
    const migration = read("supabase/migrations/20260925100000_prospect_review_gate.sql");
    expect(migration).toContain("create table public.project_appointments");
    expect(migration).toContain("create table public.project_validations");
    expect(migration).toContain("project_appointments_prospect_select");
    expect(migration).toContain("profile.role = 'prospect'");
    expect(migration).toContain("project_validations_admin_all");
    expect(migration).toContain("revoke all on public.project_appointments from anon, authenticated");
    expect(migration).toContain("revoke all on public.project_validations from anon, authenticated");
    expect(migration).not.toMatch(/grant\s+(insert|update|all).*project_validations\s+to\s+authenticated/i);
    expect(migration).not.toMatch(/grant\s+(insert|update|all).*project_appointments\s+to\s+authenticated/i);
  });

  it("checks FeaseWeb approval before any Checkout Session creation", () => {
    const route = read("app/api/billing/checkout/route.ts");
    expect(route).toContain('from("project_validations")');
    expect(route).toContain('validation?.validation_status !== "approved"');
    expect(route).toContain('status: 403');
    expect(route).toContain('code: "project_not_approved"');
    expect(route.indexOf('validation?.validation_status !== "approved"')).toBeLessThan(route.indexOf("checkout.sessions.create"));
  });

  it("keeps administrative approval and conversion separate", () => {
    const reviewRoute = read("app/api/admin/prospects/[id]/review/route.ts");
    const webhook = read("app/api/stripe/webhook/route.ts");
    expect(reviewRoute).toContain("requireApiAdmin");
    expect(reviewRoute).toContain('appointment?.appointment_status !== "completed"');
    expect(reviewRoute).toContain("decided_by: auth.user.id");
    expect(webhook).toContain("ensureClientForProject");
    expect(webhook).not.toContain("project_validations");
  });

  it("lets an authenticated admin schedule the existing appointment record", () => {
    const reviewRoute = read("app/api/admin/prospects/[id]/review/route.ts");
    const reviewTypes = read("lib/project-review.ts");
    expect(reviewRoute).toContain('action === "schedule_appointment"');
    expect(reviewRoute).toContain('.from("project_appointments").upsert');
    expect(reviewTypes).toContain('z.literal("schedule_appointment")');
    expect(reviewRoute).toContain("requireApiAdmin");
  });

  it("does not expose the internal validation note to the prospect", () => {
    const route = read("app/api/prospect/appointment/route.ts");
    expect(route).toContain('select("id, project_intake_id, validation_status")');
    expect(route).not.toContain("internal_note");
  });
});
