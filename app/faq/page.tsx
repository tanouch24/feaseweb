import type { Metadata } from "next";
import { FAQSection } from "@/components/home/FAQSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { faqItems } from "@/lib/faq.demo";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "FAQ site internet : création, prix et maintenance | FeaseWeb",
  description:
    "Réponses aux questions sur la création de site internet, les 49 €/mois, l’hébergement, la maintenance, les modifications et le SEO inclus.",
  path: "/faq",
});

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
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
      <FAQSection headingLevel="h1" />
      <FinalCTA />
    </main>
  );
}
