import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoLeadForm } from "@/components/home/DemoLeadForm";
import ExemplesPage from "@/app/exemples/page";
import ExempleDetailPage from "@/app/exemples/[slug]/page";
import EspaceClientPage from "@/app/espace-client/page";

describe("DemoLeadForm", () => {
  it("shows a local success state instead of submitting anywhere", async () => {
    render(<DemoLeadForm mode="create" />);
    await userEvent.type(
      screen.getByLabelText("Nom de votre entreprise"),
      "Test SARL"
    );
    await userEvent.type(
      screen.getByLabelText("Votre email"),
      "contact@test-sarl.fr"
    );
    await userEvent.click(screen.getByRole("button", { name: /Envoyer/ }));
    expect(await screen.findByText(/Merci/)).toBeInTheDocument();
  });
});

describe("Exemples pages", () => {
  it("lists every demo site with its FeaseWeb-example label", () => {
    render(<ExemplesPage />);
    expect(
      screen.getAllByText("Exemple de site FeaseWeb").length
    ).toBeGreaterThan(0);
  });

  it("renders a full immersive demo site with a discreet disclosure banner", async () => {
    const Page = await ExempleDetailPage({
      params: Promise.resolve({ slug: "dupont-plomberie" }),
    });
    render(Page);
    expect(
      screen.getByRole("heading", { name: /Dupont Plomberie/ })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Démonstration FeaseWeb — entreprise fictive")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Retour aux exemples/ })).toHaveAttribute(
      "href",
      "/exemples"
    );
  });
});

describe("EspaceClientPage", () => {
  it("labels itself explicitly as a preview, not the real client space", () => {
    render(<EspaceClientPage />);
    expect(screen.getAllByText(/aperçu/i).length).toBeGreaterThan(0);
  });
});
