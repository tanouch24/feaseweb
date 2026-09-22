import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModificationFlow } from "@/components/home/ModificationFlow";
import { SEOSection } from "@/components/home/SEOSection";
import { ServiceEditorialGrid } from "@/components/home/ServiceEditorialGrid";

describe("ModificationFlow", () => {
  it("shows the three-step request workflow", () => {
    render(<ModificationFlow />);
    expect(screen.getByText("Demande envoyée")).toBeInTheDocument();
    expect(screen.getByText("Terminée")).toBeInTheDocument();
  });
});

describe("SEOSection", () => {
  it("never promises rankings, traffic, or results", () => {
    render(<SEOSection />);
    expect(
      screen.queryByText(/première position|garanti|nombre de visiteurs/i)
    ).not.toBeInTheDocument();
  });
});

describe("ServiceEditorialGrid", () => {
  it("groups services into exactly four editorial blocks", () => {
    render(<ServiceEditorialGrid />);
    expect(screen.getByText("Création")).toBeInTheDocument();
    expect(screen.getByText("Visibilité")).toBeInTheDocument();
  });
});
