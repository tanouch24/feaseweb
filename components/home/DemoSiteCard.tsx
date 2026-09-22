import Link from "next/link";
import { SiteMockup } from "@/components/mockups/SiteMockup";
import type { DemoSite } from "@/lib/demo-sites.demo";

export function DemoSiteCard({ site }: { site: DemoSite }) {
  return (
    <Link
      href={`/exemples/${site.slug}`}
      className="group block rounded-lg border border-line bg-white p-5 transition-shadow hover:shadow-md"
    >
      <SiteMockup businessName={site.name} tagline={site.tagline} />
      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{site.name}</p>
          <p className="text-sm text-ink-soft">{site.category}</p>
        </div>
        <span className="shrink-0 rounded-sm bg-bg-alt px-2.5 py-1 text-xs text-ink-soft">
          Exemple de site FeaseWeb
        </span>
      </div>
    </Link>
  );
}
