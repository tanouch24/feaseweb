"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTAButton } from "@/components/ui/CTAButton";
import { MockupFrame } from "@/components/ui/MockupFrame";
import { useInView } from "@/hooks/useInView";
import {
  GlobeIcon,
  ShieldIcon,
  WrenchIcon,
  ChartIcon,
  RequestIcon,
  HomeIcon,
} from "@/components/ui/icons";

const nodes = [
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

export function OfferSection() {
  const { ref, inView } = useInView({ threshold: 0.35 });
  const [active, setActive] = useState(0);
  const left = nodes.slice(0, 3);
  const right = nodes.slice(3);
  const ActiveIcon = nodes[active].Icon;

  return (
    <section id="tarif" className="py-20 md:py-28">
      <div
        ref={ref as (node: HTMLDivElement | null) => void}
        className="mx-auto max-w-4xl px-6 text-center"
      >
        <SectionHeading title="Et on s'occupe du reste." />

        <div className="mt-10 flex flex-col items-center">
          <p className="text-xs uppercase tracking-widest text-ink-soft">
            Création ou refonte
          </p>
          <p
            className={`mt-2 font-serif text-6xl text-ink transition-all duration-700 ease-out md:text-7xl ${
              inView ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
          >
            0 €
          </p>
          <p className="mt-4 text-sm font-medium text-ink-soft">ensuite</p>
          <p
            className={`mt-2 font-serif text-7xl text-brand-dark transition-all duration-700 ease-out md:text-8xl ${
              inView ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            49 €
          </p>
          <p className="text-lg text-ink-soft">/ mois</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-widest text-brand-dark">
            Tout compris
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4">
          <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
            {left.map((node, index) => (
              <button
                key={node.label}
                type="button"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className={`flex flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-xs transition-colors md:flex-row md:justify-end md:gap-2 md:px-3 ${
                  active === index
                    ? "border-brand bg-brand/5 text-brand-dark"
                    : "border-line text-ink-soft hover:border-ink"
                }`}
              >
                <node.Icon className="h-4 w-4" />
                {node.label}
              </button>
            ))}
          </div>

          <div className="order-first md:order-none">
            <MockupFrame>
              <div className="flex w-56 flex-col items-center rounded-md border border-line bg-white px-6 py-8 shadow-sm">
                <ActiveIcon className="h-8 w-8 text-brand" />
                <p className="mt-3 font-serif text-lg text-ink">Votre site</p>
                <p key={active} className="animate-rise mt-3 text-sm text-ink-soft">
                  {nodes[active].description}
                </p>
              </div>
            </MockupFrame>
          </div>

          <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
            {right.map((node, index) => {
              const realIndex = index + 3;
              return (
                <button
                  key={node.label}
                  type="button"
                  onMouseEnter={() => setActive(realIndex)}
                  onFocus={() => setActive(realIndex)}
                  className={`flex flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-xs transition-colors md:flex-row md:gap-2 md:px-3 ${
                    active === realIndex
                      ? "border-brand bg-brand/5 text-brand-dark"
                      : "border-line text-ink-soft hover:border-ink"
                  }`}
                >
                  <node.Icon className="h-4 w-4" />
                  {node.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12">
          <CTAButton href="/creer-mon-site">Démarrer mon site</CTAButton>
        </div>
      </div>
    </section>
  );
}
