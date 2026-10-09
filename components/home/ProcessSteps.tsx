"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { DemoSitePreview } from "@/components/demo-sites/DemoSitePreview";
import { MockupFrame } from "@/components/ui/MockupFrame";
import { CheckIcon } from "@/components/ui/icons";
import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

const steps = [
  {
    number: "01",
    title: "Parlez-nous de votre entreprise",
    body: "Quelques questions simples, cinq minutes suffisent.",
  },
  {
    number: "02",
    title: "FeaseWeb prépare votre site",
    body: "Design, contenu, mobile, structure et référencement.",
  },
  {
    number: "03",
    title: "Vous validez",
    body: "Vous voyez le résultat avant toute mise en ligne.",
  },
  {
    number: "04",
    title: "On s'occupe du reste",
    body: "Mise en ligne, hébergement, maintenance, modifications et suivi SEO.",
  },
];

function QuestionnaireVisual() {
  return (
    <MockupFrame>
      <div className="rounded-md border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-ink-soft">
          Parlez-nous de votre activité
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-sm border border-line px-3 py-2.5 text-sm text-ink-soft">
            Nom de l&apos;entreprise
          </div>
          <div className="rounded-sm border border-line px-3 py-2.5 text-sm text-ink-soft">
            Métier
          </div>
          <div className="rounded-sm border border-line px-3 py-2.5 text-sm text-ink-soft">
            Zone d&apos;intervention
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

// The wireframe deliberately echoes DupontPlomberieSite's exact layout
// (header with name + phone pill, two-column hero, three-item services row)
// so the next step's real render reads as this same layout "getting
// skinned", not an unrelated jump.
function WireframeVisual() {
  return (
    <MockupFrame>
      <div className="overflow-hidden rounded-md border border-line bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="h-3 w-24 animate-pulse rounded-sm bg-line" />
          <div className="h-5 w-20 animate-pulse rounded-md bg-line" />
        </div>
        <div className="grid gap-6 px-5 py-5 md:grid-cols-2 md:items-center">
          <div>
            <div className="h-2 w-28 animate-pulse rounded-sm bg-line" />
            <div className="mt-3 h-5 w-40 animate-pulse rounded-sm bg-line" />
            <div className="mt-4 flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded-md bg-line" />
              <div className="h-6 w-24 animate-pulse rounded-md border border-line" />
            </div>
          </div>
          <div className="h-24 animate-pulse rounded-md bg-line" />
        </div>
        <div className="grid grid-cols-3 gap-2 px-5 pb-5">
          <div className="h-10 animate-pulse rounded-md bg-line" />
          <div className="h-10 animate-pulse rounded-md bg-line" />
          <div className="h-10 animate-pulse rounded-md bg-line" />
        </div>
        <p className="border-t border-line px-5 py-3 text-xs text-ink-soft">
          Structure et design en cours de construction…
        </p>
      </div>
    </MockupFrame>
  );
}

function ValidationVisual() {
  return (
    <div>
      <DemoSitePreview slug="dupont-plomberie" variant="thumbnail" />
      <div className="mt-4 flex items-center justify-between rounded-md border border-line bg-white px-4 py-3">
        <span className="text-sm text-ink-soft">En attente de votre validation</span>
        <span className="rounded-sm bg-brand px-3 py-1.5 text-xs font-medium text-white">
          Valider
        </span>
      </div>
    </div>
  );
}

function LiveVisual() {
  const items = ["SEO", "Maintenance", "Sécurité"];
  return (
    <div>
      <div className="relative">
        <DemoSitePreview slug="dupont-plomberie" variant="thumbnail" />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-sm bg-brand px-2.5 py-1 text-xs font-medium text-white shadow-sm">
          <CheckIcon className="h-3.5 w-3.5" />
          EN LIGNE
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 rounded-md border border-line bg-white px-4 py-3">
        {items.map((item) => (
          <span key={item} className="flex items-center gap-1.5 text-sm text-ink-soft">
            <CheckIcon className="h-3.5 w-3.5 text-brand" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

const visuals = [QuestionnaireVisual, WireframeVisual, ValidationVisual, LiveVisual];

const STEP_DURATION_MS = 5000;

export function ProcessSteps({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  const [active, setActive] = useState(0);
  // Défilement automatique tant que le visiteur n'a pas choisi une étape lui-même.
  const [auto, setAuto] = useState(true);
  const { ref, inView } = useInView({ threshold: 0.3 });
  const ActiveVisual = visuals[active];

  useEffect(() => {
    if (!auto || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(
      () => setActive((current) => (current + 1) % steps.length),
      STEP_DURATION_MS
    );
    return () => clearTimeout(timer);
  }, [active, auto, inView]);

  return (
    <section id="comment-ca-marche" className="py-16 md:py-24">
      <div
        ref={ref as (node: HTMLDivElement | null) => void}
        className="mx-auto max-w-6xl px-6"
      >
        <SectionHeading title="Comment ça marche" level={headingLevel} />
        <p className="mt-4 max-w-xl text-lg text-ink-soft">
          Quatre étapes, et vous n&apos;avez qu&apos;une seule chose à faire :
          valider.
        </p>
        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
          <ol className="grid gap-2">
            {steps.map((step, index) => {
              const isActive = index === active;
              return (
                <li key={step.number}>
                  <button
                    type="button"
                    aria-current={isActive ? "step" : undefined}
                    onClick={() => {
                      setActive(index);
                      setAuto(false);
                    }}
                    className={`relative w-full overflow-hidden rounded-md border px-5 py-4 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                      isActive
                        ? "border-brand/25 bg-white shadow-[0_1px_0_rgba(23,37,33,0.04),0_12px_32px_-18px_rgba(23,37,33,0.35)]"
                        : "border-transparent hover:bg-white/60"
                    }`}
                  >
                    <span className="flex items-baseline gap-4">
                      <span
                        className={`font-serif text-lg tabular-nums transition-colors ${
                          isActive ? "text-accent" : "text-ink-soft/50"
                        }`}
                      >
                        {step.number}
                      </span>
                      <span>
                        <span className="block text-lg font-semibold text-ink">{step.title}</span>
                        <span
                          className={`grid transition-[grid-template-rows] duration-300 ${
                            isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          }`}
                        >
                          <span className="overflow-hidden">
                            <span className="block pt-1 text-ink-soft">{step.body}</span>
                          </span>
                        </span>
                      </span>
                    </span>
                    {isActive && auto && inView && (
                      <span
                        key={`progress-${active}`}
                        aria-hidden="true"
                        className="step-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent"
                        style={{ animationDuration: `${STEP_DURATION_MS}ms` }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="min-w-0">
            <div key={active} className="animate-rise">
              <ActiveVisual />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
