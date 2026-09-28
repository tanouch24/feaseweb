import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import CommentCaMarchePage from "@/app/comment-ca-marche/page";
import TarifsPage from "@/app/tarifs/page";
import ExemplesPage from "@/app/exemples/page";
import SEOPage from "@/app/seo/page";
import FAQPage from "@/app/faq/page";
import BlogPage from "@/app/blog/page";
import { metadata as creerMetadata } from "@/app/creer-mon-site/page";
import { metadata as refaireMetadata } from "@/app/refaire-mon-site/page";
import { metadata as legalMetadata } from "@/app/mentions-legales/page";
import { metadata as privacyMetadata } from "@/app/confidentialite/page";
import { metadata as cgvMetadata } from "@/app/cgv/page";
import { metadata as cookiesMetadata } from "@/app/cookies/page";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { siteUrl } from "@/lib/site-config";

describe("SEO foundations", () => {
  it("uses the production canonical domain", () => {
    expect(siteUrl).toBe("https://feaseweb.fr");
  });

  it("publishes only useful public URLs in the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toHaveLength(20);
    expect(urls.every((url) => url.startsWith("https://feaseweb.fr/"))).toBe(true);
    expect(urls).not.toContain("https://feaseweb.fr/creer-mon-site");
    expect(urls).not.toContain("https://feaseweb.fr/refaire-mon-site");
    expect(urls.some((url) => url.includes("/admin"))).toBe(false);
    expect(urls.some((url) => url.includes("/api"))).toBe(false);
    expect(urls.some((url) => url.includes("fease.fr"))).toBe(false);
  });

  it("points robots.txt to the production sitemap without blocking HTML noindex routes", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

    expect(result.sitemap).toBe("https://feaseweb.fr/sitemap.xml");
    expect(rules[0]).toMatchObject({ disallow: ["/admin", "/api", "/auth"] });
    expect(rules[0]).not.toHaveProperty(
      "disallow",
      expect.arrayContaining(["/connexion", "/espace-client"]),
    );
  });

  it.each([
    ["comment ça marche", CommentCaMarchePage],
    ["tarifs", TarifsPage],
    ["exemples", ExemplesPage],
    ["référencement", SEOPage],
    ["FAQ", FAQPage],
    ["blog", BlogPage],
  ])("renders exactly one H1 on %s", (_name, Page) => {
    const { container } = render(<Page />);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
  });

  it("keeps conversion and legal pages out of the index", () => {
    for (const metadata of [creerMetadata, refaireMetadata, legalMetadata, privacyMetadata, cgvMetadata, cookiesMetadata]) {
      expect(metadata.robots).toMatchObject({ index: false });
    }
  });
});
