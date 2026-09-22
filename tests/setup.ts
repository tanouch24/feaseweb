import "@testing-library/jest-dom/vitest";

// jsdom does not implement matchMedia; polyfill it so hooks that check
// pointer type or reduced-motion preference (e.g. useParallax) don't throw.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList;
}

// jsdom does not implement IntersectionObserver either. Default polyfill
// reports every observed element as immediately intersecting, which is a
// sensible default for scroll-reveal/active-step hooks in tests that don't
// care about the exact trigger timing. Tests that do care (e.g. the
// useInView test) stub their own via vi.stubGlobal, which overrides this
// for that file only.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class DefaultIntersectionObserver {
    callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }
    observe(target: Element) {
      this.callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      );
    }
    unobserve() {}
    disconnect() {}
  }
  globalThis.IntersectionObserver =
    DefaultIntersectionObserver as unknown as typeof IntersectionObserver;
}
