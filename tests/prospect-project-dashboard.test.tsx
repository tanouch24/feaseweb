import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProspectProjectDashboard } from "@/components/client/ProspectProjectDashboard";
import type { OnboardingProject } from "@/lib/onboarding";

const completeProject: OnboardingProject = {
  firstName: "Ada", lastName: "Lovelace", company: "Analytical Engines", email: "ada@example.com", phone: null,
  activity: "services_entreprises", hasExistingSite: false, existingSiteUrl: null, existingSiteProject: null,
  primaryObjective: "presentation", requestedPages: ["accueil", "contact", "rendez_vous"], styleDirection: "sobre_professionnel",
  colorMood: "clair_minimal", availableAssets: ["logo", "aucun"], contactChannel: "email", contactSlot: "matin",
  currentStep: 8, projectStatus: "project_configured", completedAt: "2026-09-24T10:00:00.000Z",
};

const incompleteProject = { ...completeProject, primaryObjective: null, requestedPages: [], styleDirection: null, colorMood: null, availableAssets: [], contactChannel: null, contactSlot: null, currentStep: 3, completedAt: null };

describe("ProspectProjectDashboard", () => {
  it("explains a completed configuration, current step, summary and subscription", () => {
    render(<ProspectProjectDashboard project={completeProject} review={{ appointment: { id: "appointment-1", projectIntakeId: "intake-1", status: "completed", date: "2026-09-26", time: "10:00", phone: "0612345678", note: null }, validation: { status: "approved" } }} />);
    expect(screen.getByText("Mon site FeaseWeb")).toBeInTheDocument();
    expect(screen.getByText("Demande envoyée")).toBeInTheDocument();
    expect(screen.getAllByText("Terminée").length).toBeGreaterThan(0);
    expect(screen.getByText("Paiement")).toBeInTheDocument();
    expect(screen.getByText("Étape actuelle")).toBeInTheDocument();
    expect(screen.getByText("49 €")).toBeInTheDocument();
    expect(screen.getByText("/mois")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Payer mon abonnement" })).toBeInTheDocument();
    expect(screen.queryByText("Action impossible pour le moment.")).not.toBeInTheDocument();
  });

  it("requires the appointment and FeaseWeb approval before showing payment", () => {
    render(<ProspectProjectDashboard project={completeProject} />);
    expect(screen.getByRole("heading", { name: "Planifiez mon appel de validation" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Payer mon abonnement/ })).not.toBeInTheDocument();
    expect(screen.getByText("Rendez-vous")).toBeInTheDocument();
    expect(screen.getByText("Paiement")).toBeInTheDocument();
  });

  it("keeps the configuration continuation and hides payment until all eight steps are complete", () => {
    render(<ProspectProjectDashboard project={incompleteProject} />);
    expect(screen.getByRole("link", { name: "Continuer la configuration" })).toHaveAttribute("href", "/creer-mon-site");
    expect(screen.queryByRole("button", { name: /Payer mon abonnement/ })).not.toBeInTheDocument();
    expect(screen.queryByText("Action impossible pour le moment.")).not.toBeInTheDocument();
  });
});
