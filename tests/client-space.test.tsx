import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ClientSpaceSections } from "@/components/client/ClientSpaceSections";
import type { OnboardingProject } from "@/lib/onboarding";

const project: OnboardingProject = {
  firstName: "Ada", lastName: "Lovelace", company: "Analytical Engines", email: "ada@example.com", phone: "0600000000",
  activity: "services_entreprises", hasExistingSite: false, existingSiteUrl: null, existingSiteProject: null, primaryObjective: "presentation",
  requestedPages: ["accueil", "contact"], styleDirection: "sobre_professionnel", colorMood: "clair_minimal", availableAssets: ["logo"], contactChannel: "email", contactSlot: "matin",
  currentStep: 8, projectStatus: "building", completedAt: "2026-09-24T10:00:00.000Z",
};

const baseProps = {
  client: { first_name: "Ada", last_name: "Lovelace", company: "Analytical Engines", email: "ada@example.com", phone: "0600000000", status: "actif", started_at: "2026-09-24T10:00:00.000Z" },
  profile: { first_name: "Ada", last_name: "Lovelace", email: "ada@example.com" },
  project,
  site: { id: "site-1", name: "Analytical Engines", domain: "analytical-engines.fr", preview_url: "https://preview.example.test", production_url: null, status: "en_creation", created_at: "2026-09-24T10:00:00.000Z", launched_at: null },
  subscription: { status: "actif", amount_cents: 4900, currency: "EUR", next_billing_at: "2026-10-24T10:00:00.000Z", cancel_at_period_end: false, canceled_at: null, provider: "stripe" },
  payments: [{ id: "payment-1", amount_cents: 4900, status: "paye", created_at: "2026-09-24T10:00:00.000Z", invoice_reference: "INV-1", period_start: "2026-09-24", period_end: "2026-10-24" }],
  updates: [{ id: "update-1", category: "site", title: "Structure en préparation", description: "La structure du site est en cours de préparation.", status: "en_cours", activity_date: "2026-09-24", created_at: "2026-09-24T10:00:00.000Z" }],
  requests: [{ id: "request-1", title: "Ajouter une page", category: "Contenu", message: "Ajouter une page de présentation.", status: "en_cours", created_at: "2026-09-24T10:00:00.000Z", resolved_at: null }],
};

describe("ClientSpaceSections", () => {
  it("renders a simple tracking view and real client sections", () => {
    render(<ClientSpaceSections {...baseProps} seoActions={[{ id: "seo-1", date: "2026-09-24T10:00:00.000Z", action: "Title modifié", description: "Le title de la page d'accueil a été optimisé.", status: "terminee" }]} />);
    expect(screen.queryByRole("navigation", { name: "Navigation de l'espace client" })).not.toBeInTheDocument();
    expect(screen.getByText("VOTRE PARCOURS")).toBeInTheDocument();
    expect(screen.getByText("Envoyer un message à FeaseWeb")).toBeInTheDocument();
    expect(screen.getAllByText("Structure en préparation").length).toBeGreaterThan(0);
    expect(screen.getByText("Title modifié")).toBeInTheDocument();
    expect(screen.getByText("ACTIVITÉ DE VOTRE SITE")).toBeInTheDocument();
    expect(screen.getByText(/49 €/)).toBeInTheDocument();
    expect(screen.getAllByText("Ajouter une page").length).toBe(1);
  });

  it("keeps the SEO empty state honest and does not invent metrics", () => {
    render(<ClientSpaceSections {...baseProps} seoActions={[]} />);
    expect(screen.queryByText("Aucune action SEO n'a encore été enregistrée. Les interventions réalisées par FeaseWeb apparaîtront ici.")).not.toBeInTheDocument();
    expect(screen.queryByText("Clics")).not.toBeInTheDocument();
    expect(screen.queryByText("Impressions")).not.toBeInTheDocument();
    expect(screen.queryByText("Position moyenne")).not.toBeInTheDocument();
    expect(screen.getByText(/Aucune intervention pour le moment/)).toBeInTheDocument();
  });

  it("shows a safe site link when a domain exists, including during construction", () => {
    const { rerender } = render(<ClientSpaceSections {...baseProps} seoActions={[]} />);
    expect(screen.getByRole("link", { name: /Voir mon site/ })).toHaveAttribute("href", "https://analytical-engines.fr");
    rerender(<ClientSpaceSections {...baseProps} site={{ ...baseProps.site, domain: null }} seoActions={[]} />);
    expect(screen.queryByRole("link", { name: /Voir mon site/ })).not.toBeInTheDocument();
    rerender(<ClientSpaceSections {...baseProps} site={{ ...baseProps.site, status: "actif", production_url: "https://analytical-engines.fr" }} seoActions={[]} />);
    expect(screen.getByRole("link", { name: /Voir mon site/ })).toHaveAttribute("href", "https://analytical-engines.fr");
  });
});

describe("client space architecture", () => {
  it("keeps user-to-intake continuity and reads SEO from existing tables", () => {
    const page = readFileSync(resolve(process.cwd(), "app/espace-client/page.tsx"), "utf8");
    expect(page).toContain('.eq("user_id", current.user.id)');
    expect(page).toContain("Commencez votre projet FeaseWeb");
    expect(page).not.toContain("Aucun dossier client n'est encore associé");
    expect(page).toContain('from("seo_actions")');
    expect(page).toContain('from("modification_requests")');
    expect(page).toContain('from("client_updates")');
  });
});
