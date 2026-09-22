import type { Metadata } from "next";
import { FAQSection } from "@/components/home/FAQSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { faqItems } from "@/lib/faq.demo";

export const metadata: Metadata = {
  title: "Questions fréquentes — FeaseWeb",
  description:
    "Pourquoi la création est-elle à 0 € ? Que comprennent les 49 €/mois ? Le référencement est-il inclus ? Toutes les réponses sur le service FeaseWeb.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    // Answers not yet legally validated (marked "[À VALIDER AVANT
    // PRODUCTION]") are excluded from structured data — we never want a
    // placeholder to be indexed as a real answer.
    mainEntity: faqItems
      .filter((item) => !item.answer.includes("À VALIDER AVANT PRODUCTION"))
      .map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQSection />
      <FinalCTA />
    </main>
  );
}
