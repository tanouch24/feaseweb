import { SectionHeading } from "@/components/ui/SectionHeading";
import { PriceBadge } from "@/components/ui/PriceBadge";
import { CTAButton } from "@/components/ui/CTAButton";

const included = [
  "Site professionnel",
  "Jusqu'à 5 pages",
  "Version mobile",
  "Hébergement",
  "Sécurité et SSL",
  "Maintenance",
  "Sauvegardes",
  "Formulaire de devis/contact",
  "Petites modifications",
  "Référencement SEO",
  "Suivi de la visibilité Google",
  "Espace client FeaseWeb",
];

export function OfferSection() {
  return (
    <section id="tarif" className="py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <SectionHeading title="49 € / mois. Et on s'occupe du reste." />
        <div className="mt-8 flex justify-center">
          <PriceBadge />
        </div>
        <ul className="mx-auto mt-10 grid gap-3 text-left sm:grid-cols-2">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-2 text-ink-soft">
              <span className="mt-1 text-accent">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <CTAButton href="/creer-mon-site">Démarrer mon site</CTAButton>
        </div>
      </div>
    </section>
  );
}
