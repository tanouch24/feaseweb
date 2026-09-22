import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/home/Hero";

describe("Hero", () => {
  it("shows both CTAs with correct destinations", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Créer mon site" })).toHaveAttribute(
      "href",
      "/creer-mon-site"
    );
    expect(screen.getByRole("link", { name: "Refaire mon site" })).toHaveAttribute(
      "href",
      "/refaire-mon-site"
    );
  });

  it("shows the pricing and the product status pills", () => {
    render(<Hero />);
    expect(screen.getByText(/49\s?€/)).toBeInTheDocument();
    expect(screen.getByText("Site en ligne")).toBeInTheDocument();
    expect(screen.getByText("SEO actif")).toBeInTheDocument();
    expect(screen.getByText("SSL sécurisé")).toBeInTheDocument();
    expect(screen.getByText("Mobile optimisé")).toBeInTheDocument();
  });
});
