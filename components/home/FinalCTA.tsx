import { CTAButton } from "@/components/ui/CTAButton";

export function FinalCTA() {
  return (
    <section className="bg-brand py-20 text-white md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="font-serif text-3xl md:text-4xl">Vous avez une entreprise.</p>
        <p className="font-serif text-3xl text-white/90 md:text-4xl">
          On s&apos;occupe de son site.
        </p>
        <p className="mx-auto mt-5 max-w-md text-white/80">
          Création ou refonte sans frais de création. Puis 49 €/mois,
          référencement compris.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <CTAButton href="/creer-mon-site">Créer mon site</CTAButton>
          <a href="/refaire-mon-site" className="text-sm text-white/80 hover:text-white">
            J&apos;ai déjà un site →
          </a>
        </div>
      </div>
    </section>
  );
}
