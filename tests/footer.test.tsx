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

  it("shows the verified operating identity without publishing placeholders", () => {
    render(<Footer />);
    expect(screen.getByText(/NB CONSULTING/)).toBeInTheDocument();
    expect(screen.queryByText(/TODO/)).not.toBeInTheDocument();
  });
});
