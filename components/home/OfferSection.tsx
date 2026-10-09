import { CTAButton } from "@/components/ui/CTAButton";
import {
  GlobeIcon,
  ShieldIcon,
  WrenchIcon,
  ChartIcon,
  RequestIcon,
  HomeIcon,
} from "@/components/ui/icons";

const included = [
  {
    label: "Site",
    Icon: GlobeIcon,
    description: "Un site professionnel, pensé pour convertir vos visiteurs.",
  },
  {
    label: "Hébergement",
    Icon: HomeIcon,
    description:
      "Votre site reste rapide et disponible, sans que vous ayez à vous en soucier.",
  },
  {
    label: "Maintenance",
    Icon: WrenchIcon,
    description: "Mises à jour techniques et surveillance continues.",
  },
  {
    label: "SEO",
    Icon: ChartIcon,
    description: "Un référencement travaillé et suivi dans la durée.",
  },
  {
    label: "Sécurité",
    Icon: ShieldIcon,
    description: "SSL et sécurité gérés en continu.",
  },
  {
    label: "Modifications",
    Icon: RequestIcon,
    description: "Vos petites demandes de changement sont prises en charge.",
  },
];

export function OfferSection({
  headingLevel = "h2",
  heading = "Un seul prix. Tout est compris.",
}: {
  headingLevel?: "h1" | "h2";
  heading?: string;
}) {
  const Heading = headingLevel;

  return (
    <section id="tarif" className="px-3 py-6 md:px-5 md:py-8">
      <div className="rounded-lg bg-white py-16 shadow-[0_1px_0_rgba(23,37,33,0.05)] md:py-24">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div>
            <Heading className="font-serif text-[2rem] leading-[1.05] text-ink md:text-[2.75rem]">
              {heading}
            </Heading>
            <div className="mt-10 rounded-md bg-night p-7 text-white">
              <div className="flex items-baseline justify-between gap-4 border-b border-white/15 pb-5">
                <span className="text-white/70">Création ou refonte</span>
                <span className="font-serif text-4xl font-semibold">0 €</span>
              </div>
              <div className="flex items-baseline justify-between gap-4 pt-5">
                <span className="text-white/70">Ensuite, chaque mois</span>
                <span className="font-serif text-6xl font-semibold tracking-[-0.04em] text-accent">
                  49 €
                </span>
              </div>
              <p className="mt-5 inline-block rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent-soft">
                Tout compris, sans option payante
              </p>
            </div>
            <p className="mt-6 text-ink-soft">
              Vous voyez votre site avant de vous engager.
            </p>
            <div className="mt-8">
              <CTAButton href="/creer-mon-site">Démarrer mon site</CTAButton>
            </div>
          </div>

          <ul className="grid content-start gap-x-10 sm:grid-cols-2">
            {included.map(({ label, Icon, description }) => (
              <li key={label} className="border-t border-line py-6">
                <Icon className="h-6 w-6 text-accent" />
                <p className="mt-4 text-lg font-semibold text-ink">{label}</p>
                <p className="mt-1 text-ink-soft">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
