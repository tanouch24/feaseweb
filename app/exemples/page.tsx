import { SectionHeading } from "@/components/ui/SectionHeading";
import { DemoSiteCard } from "@/components/home/DemoSiteCard";
import { demoSites } from "@/lib/demo-sites.demo";

export default function ExemplesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading
        eyebrow="Exemples de sites FeaseWeb"
        title="Quatre métiers, quatre sites."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {demoSites.map((site) => (
          <DemoSiteCard key={site.slug} site={site} />
        ))}
      </div>
    </main>
  );
}
