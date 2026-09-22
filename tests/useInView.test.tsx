import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe() {
    this.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

describe("RevealOnScroll", () => {
  it("marks content as visible once it intersects", () => {
    render(
      <RevealOnScroll>
        <p>Contenu révélé</p>
      </RevealOnScroll>
    );
    expect(screen.getByText("Contenu révélé")).toBeVisible();
  });
});
