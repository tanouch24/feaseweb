import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoLeadForm } from "@/components/home/DemoLeadForm";
import ExemplesPage from "@/app/exemples/page";
import ExempleDetailPage from "@/app/exemples/[slug]/page";
import EspaceClientPage from "@/app/espace-client/page";

describe("DemoLeadForm", () => {
  it("shows a server-backed confirmation after a valid submission", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ ok: true }) })));
    render(<DemoLeadForm mode="create" />);
    await userEvent.type(screen.getByLabelText("Prénom"), "Test");
    await userEvent.type(screen.getByLabelText("Nom"), "Client");
    await userEvent.type(
      screen.getByLabelText("Nom de votre entreprise"),
      "Test SARL"
    );
    await userEvent.type(
      screen.getByLabelText("Votre email"),
      "contact@test-sarl.fr"
    );
    await userEvent.click(screen.getByLabelText(/J'accepte/));
    await userEvent.click(screen.getByRole("button", { name: /Envoyer/ }));
    expect(await screen.findByText(/Votre demande a bien été reçue/)).toBeInTheDocument();
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
  it("is an async server-gated page", () => {
    expect(EspaceClientPage.constructor.name).toBe("AsyncFunction");
  });
});
