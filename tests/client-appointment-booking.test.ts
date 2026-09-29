import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("shared appointment booking", () => {
  it("resolves prospect and client dossiers from the authenticated server identity", () => {
    const route = read("app/api/prospect/appointment/route.ts");
    expect(route).toContain('current.role !== "prospect" && current.role !== "client"');
    expect(route).toContain('.eq("user_id", current.user.id)');
    expect(route).toContain('.eq("client_id", client.id)');
    expect(route).not.toContain("request.json().client_id");
    expect(route).not.toContain("request.json().project_intake_id");
  });

  it("keeps the client form minimal and uses the existing appointment endpoint", () => {
    const form = read("components/client/ClientAppointmentCard.tsx");
    expect(form).toContain('fetch("/api/prospect/appointment"');
    expect(form).toContain("Confirmer mon rendez-vous");
    expect(form).toContain("Rendez-vous effectué ✓");
  });

  it("keeps anonymous access rejected and uses the existing appointment table", () => {
    const route = read("app/api/prospect/appointment/route.ts");
    expect(route).toContain("getAuthenticatedProfile");
    expect(route).toContain('from("project_appointments")');
    expect(route).toContain('onConflict: "project_intake_id"');
  });
});
