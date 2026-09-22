import { SectionHeading } from "@/components/ui/SectionHeading";
import { DemoSiteCard } from "@/components/home/DemoSiteCard";
import { demoSites } from "@/lib/demo-sites.demo";

export function ExamplesSection() {
  return (
    <section id="exemples" className="bg-bg-alt py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Exemples de sites FeaseWeb"
          title="Si votre site ressemble à ça, c'est normal."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {demoSites.map((site) => (
            <DemoSiteCard key={site.slug} site={site} />
          ))}
        </div>
      </div>
    </section>
  );
}
