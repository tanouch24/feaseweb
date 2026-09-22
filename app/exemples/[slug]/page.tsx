import { notFound } from "next/navigation";
import { SiteMockup } from "@/components/mockups/SiteMockup";
import { PhoneMockup } from "@/components/mockups/PhoneMockup";
import { demoSites } from "@/lib/demo-sites.demo";

export function generateStaticParams() {
  return demoSites.map((site) => ({ slug: site.slug }));
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
    <main className="mx-auto max-w-4xl px-6 py-20">
      <span className="rounded-sm bg-bg-alt px-2.5 py-1 text-xs text-ink-soft">
        Exemple de site FeaseWeb
      </span>
      <h1 className="mt-4 font-serif text-3xl text-ink md:text-4xl">
        {site.name}
      </h1>
      <p className="mt-2 text-ink-soft">{site.description}</p>
      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-start">
        <SiteMockup businessName={site.name} tagline={site.tagline} />
        <PhoneMockup businessName={site.name} />
      </div>
    </main>
  );
}
