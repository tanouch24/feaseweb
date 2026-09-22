"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckIcon } from "@/components/ui/icons";
import { useInView } from "@/hooks/useInView";

const stages = ["Envoyée", "En cours", "Terminée"];

const requests = [
  "Nouveaux horaires",
  "Changement de photo",
  "Nouvelle prestation",
  "Correction d'un texte",
];

export function ModificationFlow() {
  const { ref, inView } = useInView({ threshold: 0.4 });
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      const immediate = setTimeout(() => setStage(2), 0);
      return () => clearTimeout(immediate);
    }
    const toInProgress = setTimeout(() => setStage(1), 1100);
    const toDone = setTimeout(() => setStage(2), 2400);
    return () => {
      clearTimeout(toInProgress);
      clearTimeout(toDone);
    };
  }, [inView]);

  return (
    <section className="bg-bg-alt py-20 md:py-28">
      <div
        ref={ref as (node: HTMLDivElement | null) => void}
        className="mx-auto max-w-4xl px-6"
      >
        <SectionHeading title="Besoin de changer quelque chose ? Demandez-le." />

        <div className="mt-10 grid gap-6 md:grid-cols-2 md:items-start">
          <div className="rounded-md border border-line bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              Votre demande
            </p>
            <p className="mt-2 text-ink">
              « Nous fermons désormais à 18h le vendredi. »
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {stages.map((label, index) => (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-300 ${
                      index <= stage
                        ? "border-brand bg-brand/10 text-brand-dark"
                        : "border-line text-ink-soft"
                    }`}
                  >
                    {index <= stage && <CheckIcon className="h-3 w-3" />}
                    {label}
                  </span>
                  {index < stages.length - 1 && (
                    <span className="text-ink-soft">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-line bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              Aperçu du site
            </p>
            <p className="mt-2 font-serif text-lg text-ink">Horaires</p>
            <p className="mt-1 text-sm text-ink-soft">
              Lundi – Jeudi : 8h – 19h
              <br />
              Vendredi : {stage === 2 ? "8h – 18h" : "8h – 19h"}
            </p>
            {stage === 2 && (
              <p className="animate-rise mt-3 flex items-center gap-1.5 text-xs text-brand-dark">
                <CheckIcon className="h-3.5 w-3.5" />
                Mis à jour
              </p>
            )}
          </div>
        </div>

        <p className="mt-8 text-ink-soft">Pas besoin de toucher au site vous-même.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {requests.map((request) => (
            <li
              key={request}
              className="rounded-md border border-line bg-white px-4 py-3 text-sm text-ink-soft"
            >
              {request}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
