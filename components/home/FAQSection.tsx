"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqItems } from "@/lib/faq.demo";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-bg-alt py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading title="Questions fréquentes" />
        <div className="mt-8 divide-y divide-line border-y border-line">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="font-medium text-ink">{item.question}</span>
                  <span className="text-ink-soft">{isOpen ? "—" : "+"}</span>
                </button>
                {isOpen && <p className="pb-5 text-ink-soft">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
