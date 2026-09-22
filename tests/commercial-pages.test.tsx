import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import CreationSiteInternetPage from "@/app/creation-site-internet/page";
import RefonteSiteInternetPage from "@/app/refonte-site-internet/page";
import ContactPage from "@/app/contact/page";
import AProposPage from "@/app/a-propos/page";
import NotFound from "@/app/not-found";

describe("commercial routes", () => {
  it("explains managed creation with the single offer", () => {
    render(<CreationSiteInternetPage />);
    expect(screen.getByRole("heading", { name: /site professionnel pour votre activité/i })).toBeInTheDocument();
    expect(screen.getAllByText(/49 €/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Créer mon site" })[0]).toHaveAttribute("href", "/creer-mon-site");
  });

  it("keeps redesign messaging distinct from creation", () => {
    render(<RefonteSiteInternetPage />);
    expect(screen.getByRole("heading", { name: /Votre site a vieilli/i })).toBeInTheDocument();
    expect(screen.getByText(/adresse de votre site actuel/i)).toBeInTheDocument();
  });

  it("provides contact, about and not-found states", () => {
    render(<ContactPage />);
    expect(screen.getByRole("heading", { name: /question avant de commencer/i })).toBeInTheDocument();
    render(<AProposPage />);
    expect(screen.getByRole("heading", { name: /site internet utile/i })).toBeInTheDocument();
    render(<NotFound />);
    expect(screen.getByRole("link", { name: /Retour à l'accueil/i })).toHaveAttribute("href", "/");
  });
});
