import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PresentationVideo } from "@/components/home/PresentationVideo";

describe("PresentationVideo", () => {
  it("ships a muted, lazily loaded video with a poster and a pause control", () => {
    const { container } = render(<PresentationVideo />);
    const video = container.querySelector("video")!;
    expect(video.muted).toBe(true);
    expect(video.getAttribute("preload")).toBe("none");
    expect(video.getAttribute("poster")).toBe("/videos/feaseweb-presentation-poster.jpg");
    expect(screen.getByRole("button", { name: "Lire la vidéo" })).toBeInTheDocument();
  });
});
