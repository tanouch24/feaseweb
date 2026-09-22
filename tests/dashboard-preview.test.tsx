import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPreview } from "@/components/mockups/DashboardPreview";
import { ClientSpaceSection } from "@/components/home/ClientSpaceSection";

describe("DashboardPreview", () => {
  it("shows the site status, requests, and subscription state", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("En ligne")).toBeInTheDocument();
    expect(screen.getByText("1 modification en cours")).toBeInTheDocument();
    expect(screen.getByText(/49\s?€\s?\/\s?mois — Actif/)).toBeInTheDocument();
  });
});

describe("ClientSpaceSection", () => {
  it("renders the client-space headline", () => {
    render(<ClientSpaceSection />);
    expect(screen.getByText("Votre site, toujours sous contrôle.")).toBeInTheDocument();
  });
});
