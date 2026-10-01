import type { Metadata } from "next";
import { SEOSection } from "@/components/home/SEOSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { RelatedLinks } from "@/components/home/RelatedLinks";
import { pageMetadata } from "@/lib/seo-metadata";
import { siteUrl } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata({
  title: "Référencement naturel inclus pour votre site | FeaseWeb",
  description:
    "Le référencement naturel est inclus dans l’abonnement FeaseWeb : indexation, structure, contenus, performance et suivi de visibilité.",
  path: "/seo",
});

export default function SEOPage() {
  const faq = [
    { question: "Le SEO local garantit-il une place sur Google ?", answer: "Non. Il améliore les fondations du site et la compréhension de l’activité, sans garantir une position." },
    { question: "Le référencement est-il une option ?", answer: "Non. Les fondations SEO sont incluses dans la formule FeaseWeb à 49 €/mois." },
    { question: "Faut-il une fiche Google Business Profile ?", answer: "Elle peut être utile pour une activité locale, mais elle reste un outil distinct du site et doit être gérée avec des informations exactes." },
    { question: "Quand voit-on les effets du SEO ?", answer: "Le délai varie selon le secteur, le site et la concurrence. Aucun délai ou volume de trafic n’est garanti." },
  ];
  const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...faqJsonLd, url: new URL("/seo", siteUrl).toString() }) }} />
      <SEOSection detailed headingLevel="h1" heading="Référencement naturel pour artisans et petites entreprises." />
      <RelatedLinks links={[{ label: "Voir le site internet pour artisan", href: "/site-internet-artisan" }, { label: "Découvrir la création de site", href: "/creation-site-internet" }, { label: "Voir la maintenance incluse", href: "/maintenance-site-internet" }, { label: "Découvrir le tarif du site géré", href: "/tarifs" }]} />
      <FinalCTA />
    </main>
  );
}
