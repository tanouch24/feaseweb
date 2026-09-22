import { CTAButton } from "@/components/ui/CTAButton";

export function TwoPathsCards() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-8">
          <p className="font-serif text-2xl text-ink">Je n&apos;ai pas de site</p>
          <p className="mt-2 text-brand-dark">On part de zéro.</p>
          <p className="mt-4 text-ink-soft">
            FeaseWeb récupère les informations de votre entreprise et prépare
            votre site.
          </p>
          <div className="mt-6">
            <CTAButton href="/creer-mon-site">Créer mon site</CTAButton>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-8">
          <p className="font-serif text-2xl text-ink">J&apos;ai déjà un site</p>
          <p className="mt-2 text-brand-dark">On peut faire beaucoup mieux.</p>
          <p className="mt-4 text-ink-soft">
            Donnez-nous votre adresse actuelle, FeaseWeb prépare sa refonte.
          </p>
          <div className="mt-6">
            <CTAButton href="/refaire-mon-site" variant="secondary">
              Refaire mon site
            </CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
}
