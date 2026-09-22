import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TransformationSection } from "@/components/home/TransformationSection";
import { BeforeAfterSlider } from "@/components/home/BeforeAfterSlider";

describe("TransformationSection", () => {
  it("labels the comparison as a fictional demonstration, not a real client", () => {
    render(<TransformationSection />);
    expect(screen.getByText(/Démonstration fictive/)).toBeInTheDocument();
    expect(screen.queryByText(/vrai client|client réel/i)).not.toBeNull();
  });
});

describe("BeforeAfterSlider", () => {
  it("moves the divider when the slider control changes", () => {
    render(<BeforeAfterSlider />);
    const slider = screen.getByRole("slider", {
      name: "Comparer l'ancien site et le site FeaseWeb",
    });
    expect(slider).toHaveValue("50");
    fireEvent.change(slider, { target: { value: "80" } });
    expect(slider).toHaveValue("80");
  });
});
