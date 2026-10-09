"use client";

import Link from "next/link";
import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqItems } from "@/lib/faq.demo";

export function FAQSection({
  headingLevel = "h2",
  only,
}: {
  headingLevel?: "h1" | "h2";
  /** Indices des questions à afficher (accueil) ; toutes par défaut. */
  only?: number[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = only ? only.map((i) => faqItems[i]).filter(Boolean) : faqItems;

  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading title="Questions fréquentes" level={headingLevel} />
        <div className="mt-8 divide-y divide-line border-y border-line">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="text-[17px] font-medium text-ink">{item.question}</span>
                  <span
                    aria-hidden="true"
                    className={`relative flex h-4 w-4 flex-shrink-0 items-center justify-center transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    <span className="absolute h-px w-3.5 bg-ink-soft" />
                    <span className="absolute h-3.5 w-px bg-ink-soft" />
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-ink-soft">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {only && (
          <Link
            href="/faq"
            className="mt-6 inline-block text-[15px] font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
          >
            Voir toutes les questions
          </Link>
        )}
      </div>
    </section>
  );
}
