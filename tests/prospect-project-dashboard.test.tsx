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
    render(<ProspectProjectDashboard project={completeProject} />);
    expect(screen.getAllByText("Votre projet est configuré").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Nous avons toutes les informations nécessaires pour préparer votre site.").length).toBe(2);
    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(screen.getByText("Terminée")).toBeInTheDocument();
    expect(screen.getByText("Abonnement")).toBeInTheDocument();
    expect(screen.getByText("Étape actuelle")).toBeInTheDocument();
    expect(screen.getByText("Services aux entreprises")).toBeInTheDocument();
    expect(screen.getByText("Modifier ma configuration")).toHaveAttribute("href", "/creer-mon-site");
    expect(screen.getByText("49 €")).toBeInTheDocument();
    expect(screen.getByText("/mois")).toBeInTheDocument();
    expect(screen.getByText("0 € de frais de création")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Activer mon abonnement — 49 €/mois" })).toBeInTheDocument();
    expect(screen.queryByText("Action impossible pour le moment.")).not.toBeInTheDocument();
  });

  it("keeps the configuration continuation and hides payment until all eight steps are complete", () => {
    render(<ProspectProjectDashboard project={incompleteProject} />);
    expect(screen.getByRole("link", { name: "Continuer la configuration" })).toHaveAttribute("href", "/creer-mon-site");
    expect(screen.queryByRole("button", { name: /Activer mon abonnement/ })).not.toBeInTheDocument();
    expect(screen.queryByText("Action impossible pour le moment.")).not.toBeInTheDocument();
  });
});
