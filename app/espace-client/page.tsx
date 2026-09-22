import { DashboardPreview } from "@/components/mockups/DashboardPreview";

export default function EspaceClientPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
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
    </main>
  );
}
