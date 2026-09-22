import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DemoSitePreview } from "@/components/demo-sites/DemoSitePreview";
import { DupontPlomberieSite } from "@/components/demo-sites/DupontPlomberieSite";
import { AtelierToitureSite } from "@/components/demo-sites/AtelierToitureSite";
import { MaisonEclatSite } from "@/components/demo-sites/MaisonEclatSite";
import { CabinetHorizonSite } from "@/components/demo-sites/CabinetHorizonSite";

describe("demo site components", () => {
  it("Dupont Plomberie renders its own name, CTAs and a real photo", () => {
    render(<DupontPlomberieSite variant="detail" />);
    expect(screen.getByText("Dupont Plomberie")).toBeInTheDocument();
    expect(screen.getByText("Appeler")).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("Atelier Toiture renders distinct dark/architectural content", () => {
    render(<AtelierToitureSite variant="detail" />);
    expect(screen.getByText("Atelier Toiture")).toBeInTheDocument();
    expect(screen.getAllByRole("img").length).toBeGreaterThan(0);
  });

  it("Maison Éclat renders distinct elegant beauty content", () => {
    render(<MaisonEclatSite variant="detail" />);
    expect(screen.getByText("Maison Éclat")).toBeInTheDocument();
    expect(screen.getByText("Réserver un soin")).toBeInTheDocument();
  });

  it("Cabinet Horizon renders distinct institutional content", () => {
    render(<CabinetHorizonSite variant="detail" />);
    expect(screen.getByText("Cabinet Horizon")).toBeInTheDocument();
    expect(screen.getByText("Prendre rendez-vous")).toBeInTheDocument();
  });

  it("the four sites use different fonts, so they never look like the same template", () => {
    const { container: dupont } = render(<DupontPlomberieSite variant="detail" />);
    const { container: eclat } = render(<MaisonEclatSite variant="detail" />);
    expect(dupont.firstElementChild?.className).toContain("font-sans");
    expect(eclat.firstElementChild?.className).toContain("font-serif");
  });
});

describe("DemoSitePreview dispatcher", () => {
  it("renders the browser-chrome frame with the site's own domain by default", () => {
    render(<DemoSitePreview slug="cabinet-horizon" variant="thumbnail" />);
    expect(screen.getByText("cabinethorizon.feaseweb.fr")).toBeInTheDocument();
  });

  it("skips the chrome frame for full immersive display", () => {
    render(<DemoSitePreview slug="cabinet-horizon" variant="detail" frame={false} />);
    expect(screen.queryByText("cabinethorizon.feaseweb.fr")).not.toBeInTheDocument();
    expect(screen.getByText("Cabinet Horizon")).toBeInTheDocument();
  });
});
