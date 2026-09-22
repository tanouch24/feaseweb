import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/layout/Header";

describe("Header", () => {
  it("shows the primary CTA and nav links on desktop", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Créer mon site" })).toHaveAttribute(
      "href",
      "/creer-mon-site"
    );
    expect(screen.getAllByRole("link", { name: "FAQ" })[0]).toHaveAttribute(
      "href",
      "/#faq"
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
});
