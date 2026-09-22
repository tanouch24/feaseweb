"use client";

import { useInView } from "@/hooks/useInView";

const concerns = [
  { label: "Hébergement", rotate: "-rotate-2" },
  { label: "SSL", rotate: "rotate-3" },
  { label: "Mobile", rotate: "rotate-1" },
  { label: "Sauvegardes", rotate: "-rotate-1" },
  { label: "Maintenance", rotate: "rotate-2" },
  { label: "SEO", rotate: "-rotate-3" },
  { label: "Mises à jour", rotate: "rotate-1" },
];

export function BreakSection() {
  const { ref, inView } = useInView({ threshold: 0.4 });

  return (
    <section className="bg-bg-alt py-20 md:py-28">
      <div ref={ref as (node: HTMLDivElement | null) => void} className="mx-auto max-w-3xl px-6 text-center">
        <p className="font-serif text-3xl leading-tight text-ink md:text-[2.75rem]">
          Votre métier n&apos;est pas de gérer un site internet.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {concerns.map((concern, index) => (
            <span
              key={concern.label}
              className={`${concern.rotate} rounded-sm border border-line bg-white px-3.5 py-2 text-sm text-ink-soft shadow-sm transition-all duration-500 ease-out ${
                inView
                  ? "translate-y-2 scale-90 opacity-40"
                  : "translate-y-0 scale-100 opacity-100"
              }`}
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              {concern.label}
            </span>
          ))}
        </div>

        <p
          className={`mt-10 font-serif text-3xl text-brand-dark transition-all duration-700 ease-out md:text-4xl ${
            inView ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
          style={{ transitionDelay: "420ms" }}
        >
          Ça tombe bien. C&apos;est le nôtre.
        </p>

        <p className="mx-auto mt-6 max-w-xl text-base text-ink-soft">
          Vous travaillez. Nous gérons le web.
        </p>
      </div>
    </section>
  );
}
