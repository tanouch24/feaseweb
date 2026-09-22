import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PhoneMockup } from "@/components/mockups/PhoneMockup";
import { StatusPill } from "@/components/ui/StatusPill";
import { demoSiteImages } from "@/lib/demo-site-images";

describe("mockup primitives", () => {
  it("renders the business name and photo in the phone mockup", () => {
    render(
      <PhoneMockup
        businessName="Dupont Plomberie"
        tagline="Dépannage 7j/7"
        image={demoSiteImages.plumbingHero}
      />
    );
    expect(screen.getByText("Dupont Plomberie")).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders a status pill label", () => {
    render(<StatusPill label="Site en ligne" tone="positive" />);
    expect(screen.getByText("Site en ligne")).toBeInTheDocument();
  });
});
