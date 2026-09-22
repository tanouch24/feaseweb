import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BreakSection } from "@/components/home/BreakSection";

describe("BreakSection", () => {
  it("shows the core positioning statement", () => {
    render(<BreakSection />);
    expect(
      screen.getByText("Votre métier n'est pas de gérer un site internet.")
    ).toBeInTheDocument();
    expect(screen.getByText("Et ça tombe bien : c'est le nôtre.")).toBeInTheDocument();
  });
});
