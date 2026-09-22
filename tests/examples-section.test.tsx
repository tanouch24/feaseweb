import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExamplesSection } from "@/components/home/ExamplesSection";
import { demoSites } from "@/lib/demo-sites.demo";

describe("demoSites data", () => {
  it("has exactly the four validated demo businesses", () => {
    expect(demoSites.map((s) => s.name)).toEqual([
      "Dupont Plomberie",
      "Atelier Toiture",
      "Maison Éclat",
      "Cabinet Horizon",
    ]);
  });
});

describe("ExamplesSection", () => {
  it("marks every demo card as a FeaseWeb example, not a real client", () => {
    render(<ExamplesSection />);
    const labels = screen.getAllByText("Exemple de site FeaseWeb");
    expect(labels).toHaveLength(demoSites.length);
  });
});
