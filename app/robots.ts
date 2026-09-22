import type { MetadataRoute } from "next";

const SITE_URL = "https://feaseweb.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/connexion", "/espace-client"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
