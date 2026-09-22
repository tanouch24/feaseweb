import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoSitePreview, type DemoSiteSlug } from "@/components/demo-sites/DemoSitePreview";
import { demoSites } from "@/lib/demo-sites.demo";

export function generateStaticParams() {
  return demoSites.map((site) => ({ slug: site.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = demoSites.find((candidate) => candidate.slug === slug);
  if (!site) return {};

  return {
    title: `${site.name} — Exemple de site FeaseWeb`,
    description: site.description,
    alternates: { canonical: `/exemples/${slug}` },
  };
}

export default async function ExempleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = demoSites.find((candidate) => candidate.slug === slug);
  if (!site) notFound();

  return (
    <main>
      <h1 className="sr-only">{site.name} — Exemple de site FeaseWeb</h1>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg-alt px-6 py-3 text-sm">
        <span className="text-ink-soft">
          Démonstration FeaseWeb — entreprise fictive
        </span>
        <Link href="/exemples" className="font-medium text-brand-dark hover:text-brand">
          ← Retour aux exemples
        </Link>
      </div>
      <DemoSitePreview slug={slug as DemoSiteSlug} variant="detail" frame={false} />
    </main>
  );
}
