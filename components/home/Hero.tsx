import { CTAButton } from "@/components/ui/CTAButton";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { HeroVisual } from "@/components/home/HeroVisual";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg pt-14 pb-24 md:pt-20 md:pb-32">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center md:gap-10">
        <div className="min-w-0">
          <p
            className="animate-rise text-xs font-medium uppercase tracking-widest text-brand-dark"
          >
            Le site web géré pour les petites entreprises
          </p>
          <h1
            className="animate-rise mt-4 font-serif text-4xl leading-[1.08] text-ink md:text-[3.4rem]"
            style={{ animationDelay: "70ms" }}
          >
            Votre site internet.
            <br />
            Sans avoir à vous en occuper.
          </h1>
          <p
            className="animate-rise mt-6 max-w-md break-words text-lg text-ink-soft"
            style={{ animationDelay: "150ms" }}
          >
            On le crée. On le met en ligne. On le maintient. Vous vous
            concentrez sur votre métier.
          </p>
          <div className="animate-rise mt-8" style={{ animationDelay: "230ms" }}>
            <PriceBadge />
          </div>
          <div
            className="animate-rise mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
            style={{ animationDelay: "310ms" }}
          >
            <CTAButton href="/creer-mon-site">Créer mon site</CTAButton>
            <CTAButton href="/refaire-mon-site" variant="secondary">
              Refaire mon site
            </CTAButton>
          </div>
          <p
            className="animate-rise mt-6 text-sm text-ink-soft"
            style={{ animationDelay: "380ms" }}
          >
            Site • Hébergement • Maintenance • SEO • Modifications
          </p>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}
