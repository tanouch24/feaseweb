import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComparisonBlock } from "@/components/home/ComparisonBlock";

describe("ComparisonBlock", () => {
  it("contrasts DIY effort with the FeaseWeb promise, without naming competitors", () => {
    render(<ComparisonBlock />);
    expect(screen.getByText(/Choisir un thème/)).toBeInTheDocument();
    expect(screen.getByText("Vous nous parlez de votre entreprise.")).toBeInTheDocument();
    expect(screen.queryByText(/wordpress|wix|shopify/i)).not.toBeInTheDocument();
  });
});
