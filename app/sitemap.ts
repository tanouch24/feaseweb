import type { MetadataRoute } from "next";
import { demoSites } from "@/lib/demo-sites.demo";
import { getAllSlugs } from "@/lib/blog";

const SITE_URL = "https://feaseweb.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/comment-ca-marche", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/tarifs", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/exemples", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/seo", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/creer-mon-site", priority: 0.7, changeFrequency: "yearly" as const },
    { path: "/refaire-mon-site", priority: 0.7, changeFrequency: "yearly" as const },
    { path: "/creation-site-internet", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/refonte-site-internet", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/a-propos", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/contact", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/mentions-legales", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/confidentialite", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/cgv", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/cookies", priority: 0.2, changeFrequency: "yearly" as const },
  ].map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const exampleRoutes = demoSites.map((site) => ({
    url: `${SITE_URL}/exemples/${site.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const blogRoutes = getAllSlugs().map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...exampleRoutes, ...blogRoutes];
}
