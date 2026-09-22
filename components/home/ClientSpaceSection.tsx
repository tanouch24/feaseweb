import { SectionHeading } from "@/components/ui/SectionHeading";
import { DashboardPreview } from "@/components/mockups/DashboardPreview";

export function ClientSpaceSection() {
  return (
    <section id="espace-client" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading title="Votre site, toujours sous contrôle." />
        <p className="mt-4 max-w-xl text-ink-soft">
          Un espace simple pour voir l&apos;état de votre site, suivre votre
          référencement et demander une modification — sans jamais toucher au
          code.
        </p>
        <div className="mt-10">
          <DashboardPreview compact />
        </div>
        <p className="mt-4 text-xs text-ink-soft">
          Aperçu de l&apos;espace client FeaseWeb.
        </p>
      </div>
    </section>
  );
}
