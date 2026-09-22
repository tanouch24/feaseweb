import type { Metadata } from "next";
import { DashboardPreview } from "@/components/mockups/DashboardPreview";
import { ModificationFlow } from "@/components/home/ModificationFlow";
import { FinalCTA } from "@/components/home/FinalCTA";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export const metadata: Metadata = {
  title: "Espace client — FeaseWeb",
  description:
    "Suivez l'état de votre site, votre référencement et vos demandes de modification depuis votre espace client FeaseWeb.",
  alternates: { canonical: "/espace-client" },
};

export default function EspaceClientPage() {
  return (
    <main>
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="font-serif text-3xl text-ink md:text-4xl">
          Votre site, toujours sous contrôle.
        </h1>
        <p className="mt-3 text-ink-soft">
          Aperçu de démonstration de l&apos;espace client FeaseWeb — les données
          affichées ici sont fictives.
        </p>
        <div className="mt-10">
          <DashboardPreview />
        </div>
      </div>
      <RevealOnScroll>
        <ModificationFlow />
      </RevealOnScroll>
      <FinalCTA />
    </main>
  );
}
