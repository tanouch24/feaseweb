"use client";

import { useInView } from "@/hooks/useInView";

const words = ["CRÉÉ.", "HÉBERGÉ.", "MAINTENU.", "RÉFÉRENCÉ."];

export function KineticWords() {
  const { ref, inView } = useInView({ threshold: 0.5 });

  return (
    <section className="bg-brand py-16 text-white md:py-20">
      <div
        ref={ref as (node: HTMLDivElement | null) => void}
        className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-4 gap-y-2 px-6 text-center"
      >
        {words.map((word, index) => (
          <span
            key={word}
            className={`font-serif text-3xl transition-all duration-500 ease-out md:text-5xl ${
              inView ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            style={{ transitionDelay: `${index * 180}ms` }}
          >
            {word}
          </span>
        ))}
      </div>
    </section>
  );
}
