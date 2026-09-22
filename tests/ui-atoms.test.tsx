import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/layout/Logo";
import { CTAButton } from "@/components/ui/CTAButton";

describe("Logo", () => {
  it("renders the FeaseWeb wordmark", () => {
    render(<Logo />);
    expect(screen.getByText("Fease")).toBeInTheDocument();
    expect(screen.getByText("Web")).toBeInTheDocument();
  });
});

describe("CTAButton", () => {
  it("renders a link with the given label and href", () => {
    render(<CTAButton href="/creer-mon-site">Créer mon site</CTAButton>);
    const link = screen.getByRole("link", { name: "Créer mon site" });
    expect(link).toHaveAttribute("href", "/creer-mon-site");
  });

  it("applies the secondary variant styles", () => {
    render(
      <CTAButton href="/refaire-mon-site" variant="secondary">
        Refaire mon site
      </CTAButton>
    );
    const link = screen.getByRole("link", { name: "Refaire mon site" });
    expect(link.className).toContain("border");
  });
});
