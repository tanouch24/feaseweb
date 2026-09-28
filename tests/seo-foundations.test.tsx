import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import CommentCaMarchePage from "@/app/comment-ca-marche/page";
import TarifsPage from "@/app/tarifs/page";
import ExemplesPage from "@/app/exemples/page";
import SEOPage from "@/app/seo/page";
import FAQPage from "@/app/faq/page";
import BlogPage from "@/app/blog/page";
import { metadata as homeMetadata } from "@/app/page";
import { metadata as commentMetadata } from "@/app/comment-ca-marche/page";
import { metadata as tarifsMetadata } from "@/app/tarifs/page";
import { metadata as exemplesMetadata } from "@/app/exemples/page";
import { metadata as seoMetadata } from "@/app/seo/page";
import { metadata as faqMetadata } from "@/app/faq/page";
import { metadata as blogMetadata } from "@/app/blog/page";
import { metadata as creationMetadata } from "@/app/creation-site-internet/page";
import { metadata as refonteMetadata } from "@/app/refonte-site-internet/page";
import { metadata as aboutMetadata } from "@/app/a-propos/page";
import { metadata as contactMetadata } from "@/app/contact/page";
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

  it("keeps the principal indexable pages distinct and fully described", () => {
    const metadata = [
      homeMetadata,
      commentMetadata,
      tarifsMetadata,
      exemplesMetadata,
      seoMetadata,
      faqMetadata,
      blogMetadata,
      creationMetadata,
      refonteMetadata,
      aboutMetadata,
      contactMetadata,
    ];
    const titles = metadata.map((entry) => entry.title);
    const descriptions = metadata.map((entry) => entry.description);

    expect(titles.every((title) => typeof title === "string" && title.length > 0)).toBe(true);
    expect(descriptions.every((description) => typeof description === "string" && description.length > 0)).toBe(true);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    expect(JSON.stringify(metadata)).not.toContain("fease.fr");
    expect(JSON.stringify(metadata)).not.toContain("netlify.app");
  });

  it("keeps the examples page explicit about demonstrations", () => {
    const { container } = render(<ExemplesPage />);

    expect(container.textContent).toContain("Démonstrations");
    expect(container.textContent).toContain("Démonstration fictive");
  });
});
