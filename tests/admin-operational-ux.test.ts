import { describe, expect, it } from "vitest";
import { getProjectStatusLabel, getProspectBusinessState } from "@/lib/admin-presentation";
import type { Prospect } from "@/lib/backoffice";

const prospect = (overrides: Partial<Prospect> = {}): Prospect => ({ id: "p1", createdAt: "2026-01-01", firstName: "Jean", lastName: "Dupont", company: "Entreprise Dupont", email: "jean@example.com", phone: "0600000000", activity: "Artisan", city: "Lyon", currentSite: "", hasSite: false, objective: "", message: "", source: "formulaire", status: "nouveau", notes: [], ...overrides });

describe("admin business presentation", () => {
  it("derives human prospect states from existing appointment and validation statuses", () => {
    expect(getProspectBusinessState(prospect(), { id: "i1", userId: "u1", prospectId: "p1", firstName: "Jean", lastName: "Dupont", company: "Entreprise Dupont", email: "jean@example.com", phone: "", activity: "", hasExistingSite: false, existingSiteUrl: "", existingSiteProject: "", objective: "", pages: [], style: "", palette: "", assets: [], contactChannel: "", contactSlot: "", status: "project_configured", currentStep: 8 }).label).toBe("À appeler");
    expect(getProspectBusinessState(prospect({ review: { appointmentStatus: "scheduled", validationStatus: "pending" } })).nextAction).toBe("Préparer le rendez-vous");
    expect(getProspectBusinessState(prospect({ review: { appointmentStatus: "completed", validationStatus: "pending" } })).filter).toBe("to_validate");
    expect(getProspectBusinessState(prospect({ review: { appointmentStatus: "completed", validationStatus: "needs_information" } })).nextAction).toBe("Informations à obtenir");
    expect(getProspectBusinessState(prospect({ review: { appointmentStatus: "completed", validationStatus: "approved" } })).filter).toBe("approved");
  });

  it("keeps production labels derived from the existing project status", () => {
    expect(getProjectStatusLabel("building")).toBe("Site en création");
    expect(getProjectStatusLabel("client_feedback")).toBe("Retour client attendu");
    expect(getProjectStatusLabel("unknown")).toBe("État à préciser");
  });
});
