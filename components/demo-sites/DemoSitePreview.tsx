import { MockupFrame } from "@/components/ui/MockupFrame";
import { DupontPlomberieSite } from "@/components/demo-sites/DupontPlomberieSite";
import { AtelierToitureSite } from "@/components/demo-sites/AtelierToitureSite";
import { MaisonEclatSite } from "@/components/demo-sites/MaisonEclatSite";
import { CabinetHorizonSite } from "@/components/demo-sites/CabinetHorizonSite";

const registry = {
  "dupont-plomberie": { Component: DupontPlomberieSite, domain: "dupontplomberie" },
  "atelier-toiture": { Component: AtelierToitureSite, domain: "ateliertoiture" },
  "maison-eclat": { Component: MaisonEclatSite, domain: "maisoneclat" },
  "cabinet-horizon": { Component: CabinetHorizonSite, domain: "cabinethorizon" },
} as const;

export type DemoSiteSlug = keyof typeof registry;

export function DemoSitePreview({
  slug,
  variant = "thumbnail",
  scrollPreview = false,
  animate = false,
  frame = true,
  priority = false,
}: {
  slug: DemoSiteSlug;
  variant?: "thumbnail" | "detail";
  scrollPreview?: boolean;
  animate?: boolean;
  /** Set to false for full-page immersive display (no browser chrome, no
   * corner-bracket frame) — used on the example detail pages, where the
   * discreet "Démonstration FeaseWeb" banner handles disclosure instead. */
  frame?: boolean;
  /** Only true for the single above-the-fold instance (the Hero). */
  priority?: boolean;
}) {
  const { Component, domain } = registry[slug];

  const content = (
    <div
      className={
        frame ? "overflow-hidden rounded-md border border-line bg-white shadow-sm" : "bg-white"
      }
    >
      {frame && (
        <div className="flex items-center gap-2 border-b border-line bg-bg-alt px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
          </div>
          <div className="ml-2 flex-1 truncate rounded-sm bg-white px-3 py-1 text-[11px] text-ink-soft">
            {domain}.feaseweb.fr
          </div>
        </div>
      )}
      {variant === "thumbnail" ? (
        <div className="h-60 overflow-hidden">
          <div
            className={`${animate ? "animate-rise" : ""} ${
              scrollPreview
                ? "transition-transform duration-700 ease-out group-hover:-translate-y-14"
                : ""
            }`}
            style={animate ? { animationDelay: "420ms" } : undefined}
          >
            <Component
              variant="thumbnail"
              scrollPreview={scrollPreview}
              priority={priority}
            />
          </div>
        </div>
      ) : (
        <Component variant="detail" priority={priority} />
      )}
    </div>
  );

  return frame ? <MockupFrame>{content}</MockupFrame> : content;
}
