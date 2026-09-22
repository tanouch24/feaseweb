import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DemoSiteCard } from "@/components/home/DemoSiteCard";
import { TransformationSection } from "@/components/home/TransformationSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { demoSites } from "@/lib/demo-sites.demo";

export const metadata: Metadata = {
  title: "Exemples de sites FeaseWeb",
  description:
    "Quatre métiers, quatre sites créés par FeaseWeb : artisan, bâtiment, beauté et profession libérale. Découvrez le résultat.",
  alternates: { canonical: "/exemples" },
};

export default function ExemplesPage() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeading
          eyebrow="Exemples de sites FeaseWeb"
          title="Quatre métiers, quatre sites."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
