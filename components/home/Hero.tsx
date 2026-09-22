import { CTAButton } from "@/components/ui/CTAButton";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { SiteMockup } from "@/components/mockups/SiteMockup";
import { PhoneMockup } from "@/components/mockups/PhoneMockup";
import { StatusPill } from "@/components/ui/StatusPill";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg pt-14 pb-24 md:pt-20 md:pb-32">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center md:gap-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">
            Le site web géré pour les petites entreprises
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-[1.08] text-ink md:text-[3.4rem]">
            Votre site internet.
            <br />
            Sans avoir à vous en occuper.
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink-soft">
            FeaseWeb crée ou refait votre site, l&apos;héberge, le maintient et
            travaille son référencement. Vous vous concentrez sur votre métier.
          </p>
          <div className="mt-8">
            <PriceBadge />
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <CTAButton href="/creer-mon-site">Créer mon site</CTAButton>
            <CTAButton href="/refaire-mon-site" variant="secondary">
              Refaire mon site
            </CTAButton>
          </div>
          <p className="mt-6 text-sm text-ink-soft">
            Site • Hébergement • Maintenance • SEO • Modifications
          </p>
        </div>
        <div className="relative pb-10 sm:pb-14">
          <SiteMockup
            businessName="Dupont Plomberie"
            tagline="Dépannage 7j/7 dans tout le secteur"
          />
          <div className="absolute -bottom-8 -left-4 hidden sm:block">
            <PhoneMockup businessName="Dupont Plomberie" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2 sm:ml-40 sm:mt-0 sm:justify-end">
            <StatusPill label="Site en ligne" tone="positive" />
            <StatusPill label="SEO suivi" />
            <StatusPill label="Maintenance active" />
          </div>
        </div>
      </div>
    </section>
  );
}
