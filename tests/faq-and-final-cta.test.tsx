import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQSection } from "@/components/home/FAQSection";
import { FinalCTA } from "@/components/home/FinalCTA";

describe("FAQSection", () => {
  it("expands an answer when its question is clicked", async () => {
    render(<FAQSection />);
    const question = screen.getByRole("button", {
      name: /Pourquoi la création est-elle à 0 €/,
    });
    expect(question).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(question);
    expect(question).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/vrai produit FeaseWeb/)).toBeInTheDocument();
  });

  it("keeps the cancellation answer contract-neutral", () => {
    render(<FAQSection />);
    expect(screen.getByText(/modalités de résiliation et de transfert/)).toBeInTheDocument();
  });
});

describe("FinalCTA", () => {
  it("shows the primary and secondary calls to action", () => {
    render(<FinalCTA />);
    expect(screen.getByRole("link", { name: "Créer mon site" })).toHaveAttribute(
      "href",
      "/creer-mon-site"
    );
    expect(screen.getByRole("link", { name: "J'ai déjà un site →" })).toHaveAttribute(
      "href",
      "/refaire-mon-site"
    );
  });
});
