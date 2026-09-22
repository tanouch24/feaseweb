import Link from "next/link";
import { SiteMockup } from "@/components/mockups/SiteMockup";
import type { DemoSite } from "@/lib/demo-sites.demo";

export function DemoSiteCard({ site }: { site: DemoSite }) {
  return (
    <Link
      href={`/exemples/${site.slug}`}
      className="group block rounded-lg border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <SiteMockup businessName={site.name} tagline={site.tagline} scrollPreview />
      <div className="mt-4">
        <p className="font-medium text-ink">{site.name}</p>
        <p className="text-sm text-ink-soft">{site.category}</p>
        <span className="mt-2 inline-block rounded-sm bg-bg-alt px-2.5 py-1 text-xs text-ink-soft">
          Exemple de site FeaseWeb
        </span>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-brand-dark">
        Voir l&apos;exemple
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </p>
    </Link>
  );
}
