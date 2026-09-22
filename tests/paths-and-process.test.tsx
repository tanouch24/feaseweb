import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TwoPathsCards } from "@/components/home/TwoPathsCards";
import { ProcessSteps } from "@/components/home/ProcessSteps";

describe("TwoPathsCards", () => {
  it("links each path to its own funnel page", () => {
    render(<TwoPathsCards />);
    expect(screen.getByRole("link", { name: "Créer mon site" })).toHaveAttribute(
      "href",
      "/creer-mon-site"
    );
    expect(screen.getByRole("link", { name: "Refaire mon site" })).toHaveAttribute(
      "href",
      "/refaire-mon-site"
    );
  });
});

describe("ProcessSteps", () => {
  it("lists exactly four steps ending with ongoing management", () => {
    render(<ProcessSteps />);
    expect(screen.getByText("Parlez-nous de votre entreprise")).toBeInTheDocument();
    expect(screen.getByText("On s'occupe du reste")).toBeInTheDocument();
  });
});
