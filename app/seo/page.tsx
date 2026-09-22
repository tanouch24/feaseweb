import type { Metadata } from "next";
import { SEOSection } from "@/components/home/SEOSection";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Référencement SEO inclus — FeaseWeb",
  description:
    "Le référencement de votre site est inclus dans votre abonnement FeaseWeb, sans option payante séparée. Indexation, structure, contenus et suivi de la visibilité Google.",
  alternates: { canonical: "/seo" },
};

export default function SEOPage() {
  return (
    <main>
      <SEOSection />
      <FinalCTA />
    </main>
  );
}
