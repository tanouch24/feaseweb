import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OfferSection } from "@/components/home/OfferSection";

describe("OfferSection", () => {
  it("shows 0€ then 49€/mois, with no separate SEO price", () => {
    render(<OfferSection />);
    expect(screen.getByText("0 €")).toBeInTheDocument();
    expect(screen.getByText("49 €")).toBeInTheDocument();
    expect(screen.getByText("Tout compris, sans option payante")).toBeInTheDocument();
    expect(screen.queryByText(/SEO \+49/)).not.toBeInTheDocument();
  });

  it("has exactly one call to action to start", () => {
    render(<OfferSection />);
    expect(screen.getByRole("link", { name: "Démarrer mon site" })).toHaveAttribute(
      "href",
      "/creer-mon-site"
    );
  });

  it("shows what each included item means, without needing a hover", () => {
    render(<OfferSection />);
    expect(screen.getByText("SEO")).toBeInTheDocument();
    expect(screen.getByText(/référencement travaillé et suivi/)).toBeInTheDocument();
  });
});
