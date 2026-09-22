import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/Footer";

describe("Footer", () => {
  it("links to all legal pages", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Mentions légales" })).toHaveAttribute(
      "href",
      "/mentions-legales"
    );
    expect(screen.getByRole("link", { name: "CGV" })).toHaveAttribute(
      "href",
      "/cgv"
    );
  });

  it("marks missing legal info as TODO instead of inventing it", () => {
    render(<Footer />);
    expect(screen.getByText(/TODO/)).toBeInTheDocument();
  });
});
