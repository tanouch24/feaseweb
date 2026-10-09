import { SectionHeading } from "@/components/ui/SectionHeading";
import { DemoSiteCard } from "@/components/home/DemoSiteCard";
import { demoSites } from "@/lib/demo-sites.demo";

export function ExamplesSection() {
  return (
    <section id="exemples" className="bg-bg-alt py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Exemples de sites FeaseWeb"
          title="Un site qui ressemble à votre métier."
        />
        <p className="mt-4 max-w-xl text-lg text-ink-soft">
          Quatre démonstrations, quatre métiers. Chaque site est pensé pour
          son activité et ses clients, pas copié d&apos;un modèle.
        </p>
        <div className="mt-12 grid gap-x-10 gap-y-14 md:grid-cols-2">
          {demoSites.map((site) => (
            <DemoSiteCard key={site.slug} site={site} />
          ))}
        </div>
      </div>
    </section>
  );
}
