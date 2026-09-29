import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/layout/Header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

describe("Header", () => {
  it("shows the primary CTA and nav links on desktop", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Se connecter à mon compte" })).toHaveAttribute(
      "href",
      "/connexion"
    );
    expect(screen.getByRole("link", { name: "Créer mon site" })).toHaveAttribute(
      "href",
      "/creer-mon-site"
    );
    expect(screen.getAllByRole("link", { name: "FAQ" })[0]).toHaveAttribute(
      "href",
      "/faq"
    );
    expect(screen.getAllByRole("link", { name: "Blog" })[0]).toHaveAttribute(
      "href",
      "/blog"
    );
    expect(screen.getAllByRole("link", { name: "Référencement" })[0]).toHaveAttribute(
      "href",
      "/seo"
    );
  });

  it("toggles the mobile menu on button click", async () => {
    render(<Header />);
    const toggle = screen.getByRole("button", { name: /menu/i });
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();
    await userEvent.click(toggle);
    expect(screen.getByTestId("mobile-nav")).toBeInTheDocument();
    await userEvent.click(toggle);
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();
  });

  it("switches to the account and logout actions for a real session", () => {
    render(<Header role="client" />);
    expect(screen.getByRole("link", { name: "Mon compte" })).toHaveAttribute("href", "/espace-client");
    expect(screen.getByRole("button", { name: "Se déconnecter" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Créer mon site" })).not.toBeInTheDocument();
  });
});
