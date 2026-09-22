import type { MetadataRoute } from "next";

// TODO: remplacer par le nom de domaine de production réel avant mise en ligne.
const SITE_URL = "https://feaseweb.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/connexion"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
