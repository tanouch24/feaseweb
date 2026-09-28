import { describe, expect, it, beforeEach, vi } from "vitest";
import { getConsent, initializeTracking, normalizeConsent, trackEvent, trackPageView } from "@/lib/analytics";

describe("centralized tracking", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "feaseweb_consent=; Max-Age=0; Path=/";
    window.gtag = undefined;
    window.fbq = undefined;
    document.querySelectorAll("script[id^=feaseweb-]").forEach((script) => script.remove());
  });

  it("defaults to no analytics or marketing consent", () => {
    expect(getConsent()).toEqual({ analytics: false, marketing: false });
    expect(normalizeConsent({ analytics: true, marketing: "yes" })).toEqual({ analytics: true, marketing: false });
  });

  it("does not emit events before consent", () => {
    const ga = vi.fn();
    const pixel = vi.fn();
    window.gtag = ga;
    window.fbq = pixel;
    trackPageView("/");
    trackEvent("subscription_paid", "payment-1", { value: 49 });
    expect(ga).not.toHaveBeenCalled();
    expect(pixel).not.toHaveBeenCalled();
  });

  it("uses one stable event id for Pixel and the mapped GA event", async () => {
    window.localStorage.setItem("feaseweb-consent", JSON.stringify({ analytics: true, marketing: true }));
    const ga = vi.fn();
    const pixel = vi.fn();
    window.gtag = ga;
    window.fbq = pixel;
    trackEvent("checkout_started", "checkout-123", { currency: "EUR", value: 49 });
    expect(ga).toHaveBeenCalledWith("event", "begin_checkout", expect.objectContaining({ event_id: "checkout-123" }));
    expect(pixel).toHaveBeenCalledWith("track", "InitiateCheckout", expect.anything(), { eventID: "checkout-123" });
  });

  it("does not emit a duplicate page view for the same SPA path", () => {
    window.localStorage.setItem("feaseweb-consent", JSON.stringify({ analytics: true, marketing: false }));
    const ga = vi.fn();
    window.gtag = ga;
    trackPageView("/tarifs");
    trackPageView("/tarifs");
    expect(ga.mock.calls.filter(([kind, name]) => kind === "event" && name === "page_view")).toHaveLength(1);
  });

  it("starts GA4 after analytics consent", () => {
    window.localStorage.setItem("feaseweb-consent", JSON.stringify({ analytics: true, marketing: false }));

    initializeTracking();

    expect(document.querySelector("script#feaseweb-ga4")).toHaveAttribute(
      "src",
      "https://www.googletagmanager.com/gtag/js?id=G-ZE1MDKS9WV",
    );
    expect(window.dataLayer?.[0]).toEqual(expect.arrayContaining(["js"]));
    expect(window.dataLayer?.[1]).toEqual(["config", "G-ZE1MDKS9WV", { send_page_view: false }]);
  });
});

describe("server conversion boundary", () => {
  it("keeps the CAPI token server-only and hashes user fields", async () => {
    const fs = await import("node:fs/promises");
    const source = await fs.readFile("lib/meta-conversions.ts", "utf8");
    expect(source).toContain("process.env.META_CONVERSIONS_API_TOKEN");
    expect(source).not.toContain("NEXT_PUBLIC_META_CONVERSIONS_API_TOKEN");
    expect(source).toContain('createHash("sha256")');
    expect(source).not.toContain("internal_note");
  });

  it("keeps unsafe-eval development-only in the CSP", async () => {
    const fs = await import("node:fs/promises");
    const source = await fs.readFile("next.config.ts", "utf8");
    expect(source).toContain("isDevelopment ? \" 'unsafe-eval'\" : \"\"");
    expect(source).toContain("https://www.googletagmanager.com");
    expect(source).toContain("https://analytics.google.com");
    expect(source).toContain("https://connect.facebook.net");
  });
});
