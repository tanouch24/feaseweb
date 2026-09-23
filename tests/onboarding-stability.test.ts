import { describe, expect, it } from "vitest";
import { mapProjectIntake, completedOnboardingSteps, isOnboardingComplete, toOnboardingPatch } from "@/lib/onboarding";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("onboarding DB/DTO boundary", () => {
  const row = {
    id: "internal-id", user_id: "internal-user", created_at: "2026-01-01", updated_at: "2026-01-01", prospect_id: "internal-prospect", client_id: null,
    first_name: "Ada", last_name: "Lovelace", company: "Analytical Engines", email: "ada@example.com", phone: "06 12 34 56 78", activity: "services_entreprises",
    has_existing_site: false, existing_site_url: null, existing_site_project: null, primary_objective: "presentation", requested_pages: ["accueil", "contact"],
    style_direction: "sobre_professionnel", color_mood: "clair_minimal", available_assets: ["aucun"], contact_channel: "email", contact_slot: "matin", current_step: 8,
    project_status: "project_configured", completed_at: "2026-01-02", support_message: "private", support_requested_at: null,
  };

  it("maps a complete DB row without validating internal columns as a patch", () => {
    const dto = mapProjectIntake(row);
    expect(dto).toMatchObject({ firstName: "Ada", activity: "services_entreprises", currentStep: 8, projectStatus: "project_configured" });
    expect(dto).not.toHaveProperty("id");
    expect(dto).not.toHaveProperty("user_id");
    expect(dto).not.toHaveProperty("support_message");
    expect(toOnboardingPatch(dto, 8)).not.toHaveProperty("id");
    expect(toOnboardingPatch(dto, 8)).toHaveProperty("currentStep", 8);
  });

  it("counts all eight steps and treats existing-site fields conditionally", () => {
    const dto = mapProjectIntake(row);
    expect(completedOnboardingSteps(dto)).toBe(8);
    expect(isOnboardingComplete(dto)).toBe(true);
    const partial = mapProjectIntake({ ...row, has_existing_site: true, existing_site_url: null, existing_site_project: null, primary_objective: null, requested_pages: [], style_direction: null, color_mood: null, available_assets: [], contact_channel: null, contact_slot: null, current_step: 2, completed_at: null });
    expect(completedOnboardingSteps(partial)).toBe(1);
    expect(isOnboardingComplete(partial)).toBe(false);
  });

  it("keeps incomplete projects away from the payment CTA", () => {
    const dashboard = readFileSync(resolve(process.cwd(), "components/client/ProspectProjectDashboard.tsx"), "utf8");
    expect(dashboard).toContain("Commencer la configuration");
    expect(dashboard).toContain("Continuer la configuration");
    expect(dashboard).toContain("{complete && <section className=\"client-card client-offer-card\">");
    expect(dashboard).toContain("completedOnboardingSteps(project)");
  });

  it("keeps all six visual directions and the eight-step save flow", () => {
    const configurator = readFileSync(resolve(process.cwd(), "components/onboarding/OnboardingConfigurator.tsx"), "utf8");
    for (const value of ["elegant_premium", "moderne_epure", "artisan_rassurant", "dynamique_commercial", "sobre_professionnel", "chaleureux_humain"]) expect(configurator).toContain(value);
    expect(configurator).toContain("toOnboardingPatch(changes,nextStep)");
    expect(configurator).toContain("Étape {step} / 8");
  });
});
