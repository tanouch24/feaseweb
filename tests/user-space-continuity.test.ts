import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("user space continuity before client conversion", () => {
  it("resolves the space from the authenticated intake before the optional client row", () => {
    const page = source("app/espace-client/page.tsx");
    expect(page).toContain('.eq("user_id", current.user.id)');
    expect(page).toContain("const project = intake ? mapProjectIntake(intake) : null");
    expect(page).toContain("Finalisez votre demande");
    expect(page).toContain("Continuer ma configuration");
    expect(page).toContain("Commencez votre projet FeaseWeb");
    expect(page).not.toContain("Aucun dossier client n'est encore associé");
  });

  it("keeps appointment identity server-side for a clientless authenticated intake", () => {
    const route = source("app/api/prospect/appointment/route.ts");
    expect(route).toContain('.eq("user_id", current.user.id)');
    expect(route).toContain("if (userIntake)");
    expect(route).toContain("if (current.role === \"client\")");
    expect(route).toContain("project_intake_id: context.intake.id");
    expect(route).not.toContain("request.json().client_id");
  });

  it("uses the existing support mechanism without accepting a dossier id", () => {
    const form = source("components/client/ClientRequestForm.tsx");
    const route = source("app/api/onboarding/support/route.ts");
    expect(form).toContain('supportOnly ? "/api/onboarding/support"');
    expect(route).toContain('.eq("user_id", current.user.id)');
    expect(route).not.toContain("client_id");
  });
});
