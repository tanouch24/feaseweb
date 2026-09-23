import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { accountCreationSchema, onboardingPatchSchema } from "@/lib/validation";

const migration = () => readFileSync(resolve(process.cwd(), "supabase/migrations/20260923200000_guided_onboarding.sql"), "utf8");

describe("guided onboarding safeguards", () => {
  it("validates account creation and never accepts a role", () => {
    expect(accountCreationSchema.safeParse({ firstName: "A", lastName: "B", company: "Entreprise", email: "a@example.com", password: "correct-horse", confirmation: "correct-horse", privacyConsent: true }).success).toBe(true);
    expect(accountCreationSchema.safeParse({ firstName: "A", lastName: "B", company: "Entreprise", email: "a@example.com", password: "correct-horse", confirmation: "correct-horse", privacyConsent: true, role: "admin" }).success).toBe(true);
    const route = readFileSync(resolve(process.cwd(), "app/api/onboarding/account/route.ts"), "utf8");
    expect(route).not.toContain("role: parsed");
    expect(route).not.toContain("client_id");
  });

  it("models existing websites without credential fields", () => {
    const source = migration();
    expect(source).toContain("existing_site_project");
    expect(source).toContain("project_access_requirements");
    expect(source).toContain("non_necessaire");
    expect(source).not.toMatch(/wordpress_password|hosting_password|ftp_password|registrar_password/i);
    expect(source).toContain("revoke update on public.project_access_requirements");
  });

  it("allows the questionnaire to resume but protects production state", () => {
    expect(onboardingPatchSchema.safeParse({ currentStep: 4, activity: "artisan_btp", requestedPages: ["accueil", "contact"] }).success).toBe(true);
    expect(onboardingPatchSchema.safeParse({ projectStatus: "live" }).success).toBe(false);
    const route = readFileSync(resolve(process.cwd(), "app/api/onboarding/project/route.ts"), "utf8");
    expect(route).not.toContain("project_status =");
    expect(route).not.toContain("client_id =");
  });

  it("keeps Stripe prospect checkout server-controlled", () => {
    const route = readFileSync(resolve(process.cwd(), "app/api/billing/checkout/route.ts"), "utf8");
    expect(route).toContain("stripePriceId");
    expect(route).toContain("feaseweb_project_intake_id");
    expect(route).not.toContain("request.json");
  });
});
