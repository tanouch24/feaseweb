import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteMockup } from "@/components/mockups/SiteMockup";
import { PhoneMockup } from "@/components/mockups/PhoneMockup";
import { StatusPill } from "@/components/ui/StatusPill";

describe("mockup primitives", () => {
  it("renders the business name in the desktop mockup", () => {
    render(<SiteMockup businessName="Dupont Plomberie" tagline="Dépannage 7j/7" />);
    expect(screen.getByText("Dupont Plomberie")).toBeInTheDocument();
  });

  it("renders the business name in the phone mockup", () => {
    render(<PhoneMockup businessName="Dupont Plomberie" />);
    expect(screen.getByText("Dupont Plomberie")).toBeInTheDocument();
  });

  it("renders a status pill label", () => {
    render(<StatusPill label="Site en ligne" tone="positive" />);
    expect(screen.getByText("Site en ligne")).toBeInTheDocument();
  });
});
