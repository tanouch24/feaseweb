import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import CommentCaMarchePage from "@/app/comment-ca-marche/page";
import TarifsPage from "@/app/tarifs/page";
import ExemplesPage from "@/app/exemples/page";
import SEOPage from "@/app/seo/page";
import FAQPage from "@/app/faq/page";
import BlogPage from "@/app/blog/page";
import HomePage from "@/app/page";
import SiteInternetArtisanPage from "@/app/site-internet-artisan/page";
import MaintenanceSiteInternetPage from "@/app/maintenance-site-internet/page";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
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
import { metadata as artisanMetadata } from "@/app/site-internet-artisan/page";
import { metadata as maintenanceMetadata } from "@/app/maintenance-site-internet/page";
import { metadata as creerMetadata } from "@/app/creer-mon-site/page";
import { metadata as refaireMetadata } from "@/app/refaire-mon-site/page";
import { metadata as legalMetadata } from "@/app/mentions-legales/page";
import { metadata as privacyMetadata } from "@/app/confidentialite/page";
import { metadata as cgvMetadata } from "@/app/cgv/page";
import { metadata as cookiesMetadata } from "@/app/cookies/page";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { siteUrl } from "@/lib/site-config";
import { organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";

describe("SEO foundations", () => {
  it("uses the production canonical domain", () => {
    expect(siteUrl).toBe("https://feaseweb.fr");
  });

  it("publishes only verified organization and website structured data", () => {
    expect(organizationJsonLd).toMatchObject({
      "@type": "Organization",
      name: "FeaseWeb",
      alternateName: "NB CONSULTING",
      url: "https://feaseweb.fr",
    });
    expect(organizationJsonLd.identifier).toEqual([
      { "@type": "PropertyValue", propertyID: "SIREN", value: "509817649" },
      { "@type": "PropertyValue", propertyID: "SIRET", value: "50981764900080" },
    ]);
    expect(websiteJsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "FeaseWeb",
      url: "https://feaseweb.fr",
      inLanguage: "fr-FR",
    });
    expect(JSON.stringify({ organizationJsonLd, websiteJsonLd })).not.toMatch(/Review|AggregateRating|ratingValue/);
  });

  it("publishes only useful public URLs in the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toHaveLength(22);
    expect(urls.every((url) => url.startsWith("https://feaseweb.fr/"))).toBe(true);
    expect(urls).not.toContain("https://feaseweb.fr/creer-mon-site");
    expect(urls).not.toContain("https://feaseweb.fr/refaire-mon-site");
    expect(urls).toContain("https://feaseweb.fr/site-internet-artisan");
    expect(urls).toContain("https://feaseweb.fr/maintenance-site-internet");
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
    ["site internet artisan", SiteInternetArtisanPage],
    ["maintenance de site internet", MaintenanceSiteInternetPage],
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
      artisanMetadata,
      maintenanceMetadata,
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

  it("keeps the new landing pages indexable without review markup", () => {
    for (const metadata of [artisanMetadata, maintenanceMetadata]) {
      expect(metadata.robots).not.toMatchObject({ index: false });
      expect(metadata.alternates?.canonical).toMatch(/^\//);
    }

    const { container: artisan } = render(<SiteInternetArtisanPage />);
    const { container: maintenance } = render(<MaintenanceSiteInternetPage />);
    const html = `${artisan.innerHTML}${maintenance.innerHTML}`;

    expect(html).not.toContain("AggregateRating");
    expect(html).not.toContain('"@type":"Review"');
  });

  it("keeps the examples page explicit about demonstrations", () => {
    const { container } = render(<ExemplesPage />);

    expect(container.textContent).toContain("Démonstrations");
    expect(container.textContent).toContain("Démonstration fictive");
  });

  it("does not present demo sites as real client work on the home links", () => {
    const { container } = render(<HomePage />);
    expect(container.textContent).not.toContain("sites créés par FeaseWeb");
  });

  it("renders matching visual breadcrumbs and BreadcrumbList schema", () => {
    const { container } = render(
      <Breadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: "Article test", href: "/blog/article-test" },
        ]}
      />,
    );
    const schema = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}");
    const links = [...container.querySelectorAll("nav a")].map((link) => link.getAttribute("href"));

    expect(container.querySelector('nav[aria-label="Fil d’Ariane"]')).toBeTruthy();
    expect(container.textContent).toContain("Article test");
    expect(links).toEqual(["/", "/blog"]);
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement.map((item: { position: number }) => item.position)).toEqual([1, 2, 3]);
    expect(schema.itemListElement.every((item: { item: string }) => item.item.startsWith("https://feaseweb.fr/"))).toBe(true);
  });
});
