import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DemoSiteCard } from "@/components/home/DemoSiteCard";
import { TransformationSection } from "@/components/home/TransformationSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { demoSites } from "@/lib/demo-sites.demo";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Démonstrations de sites pour artisans et TPE | FeaseWeb",
  description:
    "Découvrez quatre démonstrations de sites internet pour artisan, bâtiment, beauté et profession libérale. Des exemples fictifs de l’approche FeaseWeb.",
  path: "/exemples",
});

export default function ExemplesPage() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="Exemples de sites FeaseWeb"
          title="Démonstrations de sites pour différents métiers."
          level="h1"
        />
        <div className="mt-12 grid gap-x-10 gap-y-14 md:grid-cols-2">
          {demoSites.map((site) => (
            <DemoSiteCard key={site.slug} site={site} />
          ))}
        </div>
      </div>
      <RevealOnScroll>
        <TransformationSection />
      </RevealOnScroll>
      <FinalCTA />
    </main>
  );
}
