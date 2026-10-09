import Link from "next/link";
import { DemoSitePreview, type DemoSiteSlug } from "@/components/demo-sites/DemoSitePreview";
import type { DemoSite } from "@/lib/demo-sites.demo";

export function DemoSiteCard({ site }: { site: DemoSite }) {
  return (
    <Link
      href={`/exemples/${site.slug}`}
      className="group block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      <div className="overflow-hidden rounded-lg shadow-[0_1px_0_rgba(23,37,33,0.06),0_24px_48px_-28px_rgba(23,37,33,0.45)] transition-transform duration-500 ease-out group-hover:-translate-y-1">
        <DemoSitePreview slug={site.slug as DemoSiteSlug} variant="thumbnail" scrollPreview />
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-ink">{site.name}</p>
          <p className="text-ink-soft">{site.category}</p>
          <p className="mt-1 text-[13px] text-ink-soft/80">Exemple de site FeaseWeb</p>
        </div>
        <span className="mt-1 flex-shrink-0 text-[15px] font-medium text-brand underline decoration-brand/30 underline-offset-4 transition-colors group-hover:decoration-brand">
          Voir l&apos;exemple
        </span>
      </div>
    </Link>
  );
}
