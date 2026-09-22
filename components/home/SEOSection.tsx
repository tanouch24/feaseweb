"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { MockupFrame } from "@/components/ui/MockupFrame";
import { CheckIcon } from "@/components/ui/icons";
import { useInView } from "@/hooks/useInView";

const foundations = [
  "Titre optimisé",
  "Description optimisée",
  "Page indexable",
  "Données structurées",
  "Performance",
  "Visibilité Google — suivie dans l'espace client",
];

function GoogleSnippetMockup() {
  return (
    <MockupFrame>
      <div className="rounded-md border border-line bg-white p-5 shadow-sm">
        <p className="text-[11px] text-ink-soft">Résultat de recherche — illustration</p>
        <div className="mt-3">
          <p className="text-sm text-ink-soft">dupont-plomberie.fr</p>
          <p className="mt-1 text-lg text-blue-700">
            Dupont Plomberie — Dépannage plomberie à Lyon
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Intervention rapide 7j/7, devis gratuit. Plombier agréé,
            disponible pour toutes vos urgences.
          </p>
        </div>
      </div>
    </MockupFrame>
  );
}

export function SEOSection() {
  const { ref, inView } = useInView({ threshold: 0.3 });

  return (
    <section id="seo" className="py-20 md:py-28">
      <div
        ref={ref as (node: HTMLDivElement | null) => void}
        className="mx-auto max-w-5xl px-6"
      >
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeading title="Un beau site ne suffit pas. Il faut aussi qu'on puisse le trouver." />
            <p className="mt-4 max-w-xl text-ink-soft">
              Le référencement est inclus dans votre abonnement : FeaseWeb
              travaille les fondations techniques de votre site et suit son
              évolution dans le temps.
            </p>
            <ul className="mt-8 grid gap-3">
              {foundations.map((item, index) => (
                <li
                  key={item}
                  className={`flex items-start gap-2 text-ink-soft transition-all duration-500 ease-out ${
                    inView ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 90}ms` }}
                >
                  <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <GoogleSnippetMockup />
        </div>

        <p className="mt-14 text-center font-serif text-2xl text-brand-dark md:text-3xl">
          Le référencement est compris. Pas ajouté en option.
        </p>
      </div>
    </section>
  );
}
