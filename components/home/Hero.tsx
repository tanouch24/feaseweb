import { CTAButton } from "@/components/ui/CTAButton";
import { HeroVisual } from "@/components/home/HeroVisual";

export function Hero() {
  return (
    <section className="px-3 pt-3 md:px-5 md:pt-4">
      <div className="relative overflow-hidden rounded-lg bg-night text-white">
        {/* Halo laiton très discret, pour donner de la profondeur sans décor. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 65%)" }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-14 px-6 pt-14 pb-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24">
          <div className="min-w-0">
            <p className="animate-rise text-[15px] font-medium text-accent-soft">
              Pour les artisans, TPE et indépendants
            </p>
            <h1
              className="animate-rise mt-5 font-serif text-[2.6rem] leading-[0.98] font-semibold tracking-[-0.035em] sm:text-[3.4rem] lg:text-[4.2rem]"
              style={{ animationDelay: "70ms" }}
            >
              Votre site internet.
              <br />
              Sans avoir à vous en occuper.
            </h1>
            <p
              className="animate-rise mt-7 max-w-[34rem] text-lg leading-relaxed text-white/75"
              style={{ animationDelay: "150ms" }}
            >
              FeaseWeb crée ou refait le site de votre entreprise, le met en
              ligne et s&apos;en occupe chaque mois. Vous gardez la tête à
              votre métier.
            </p>

            <dl
              className="animate-rise mt-9 grid max-w-md grid-cols-2 border-y border-white/15"
              style={{ animationDelay: "230ms" }}
            >
              <div className="py-4 pr-5">
                <dt className="text-sm text-white/60">Création ou refonte</dt>
                <dd className="mt-1 font-serif text-3xl font-semibold">0 €</dd>
              </div>
              <div className="border-l border-white/15 py-4 pl-5">
                <dt className="text-sm text-white/60">Ensuite, tout compris</dt>
                <dd className="mt-1 font-serif text-3xl font-semibold text-accent">
                  49 €<span className="text-base font-medium text-white/60"> par mois</span>
                </dd>
              </div>
            </dl>

            <div
              className="animate-rise mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
              style={{ animationDelay: "310ms" }}
            >
              <CTAButton href="/creer-mon-site" variant="brass">
                Créer mon site
              </CTAButton>
              <CTAButton href="/refaire-mon-site" variant="outlineLight">
                Refaire mon site
              </CTAButton>
            </div>
          </div>
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
