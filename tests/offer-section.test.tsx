import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OfferSection } from "@/components/home/OfferSection";

describe("OfferSection", () => {
  it("lists SEO as included, with no separate SEO price", () => {
    render(<OfferSection />);
    expect(screen.getByText("Référencement SEO")).toBeInTheDocument();
    expect(screen.queryByText(/SEO \+49/)).not.toBeInTheDocument();
  });

  it("has exactly one call to action to start", () => {
    render(<OfferSection />);
    expect(screen.getByRole("link", { name: "Démarrer mon site" })).toHaveAttribute(
      "href",
      "/creer-mon-site"
    );
  });
});
