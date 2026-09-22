import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriceBadge } from "@/components/ui/PriceBadge";

describe("PriceBadge", () => {
  it("always shows the 0€ then 49€/mois pricing, nothing else", () => {
    render(<PriceBadge />);
    expect(screen.getByText(/0\s?€/)).toBeInTheDocument();
    expect(screen.getByText(/49\s?€/)).toBeInTheDocument();
    expect(screen.getAllByText(/mois/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/39|78|98/)).not.toBeInTheDocument();
  });
});
