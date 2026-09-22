"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { DemoSitePreview } from "@/components/demo-sites/DemoSitePreview";
import { MockupFrame } from "@/components/ui/MockupFrame";
import { CheckIcon } from "@/components/ui/icons";
import { useActiveStep } from "@/hooks/useActiveStep";

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
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
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

export function ProcessSteps() {
  const { active, setStepRef } = useActiveStep(steps.length);
  const ActiveVisual = visuals[active];

  return (
    <section id="comment-ca-marche" className="bg-bg-alt py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Comment ça marche" />
        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            {steps.map((step, index) => (
              <div
                key={step.number}
                ref={setStepRef(index)}
                className="flex min-h-[45vh] flex-col justify-center border-l-2 pl-6 transition-colors duration-300 md:min-h-[55vh]"
                style={{
                  borderColor:
                    index === active
                      ? "var(--color-brand)"
                      : "var(--color-line)",
                }}
              >
                <p
                  className={`font-serif text-3xl transition-colors duration-300 ${
                    index === active ? "text-brand-dark" : "text-line"
                  }`}
                >
                  {step.number}
                </p>
                <p className="mt-3 text-xl font-medium text-ink">{step.title}</p>
                <p className="mt-2 text-ink-soft">{step.body}</p>
                <div className="mt-6 md:hidden">
                  {(() => {
                    const StepVisual = visuals[index];
                    return <StepVisual />;
                  })()}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block">
            <div className="sticky top-32">
              <div key={active} className="animate-rise">
                <ActiveVisual />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
