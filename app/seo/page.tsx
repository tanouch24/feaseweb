import type { Metadata } from "next";
import { SEOSection } from "@/components/home/SEOSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Référencement naturel inclus pour votre site | FeaseWeb",
  description:
    "Le référencement naturel est inclus dans l’abonnement FeaseWeb : indexation, structure, contenus, performance et suivi de visibilité.",
  path: "/seo",
});

export default function SEOPage() {
  return (
    <main>
      <SEOSection headingLevel="h1" heading="Le référencement naturel de votre site est inclus." />
      <FinalCTA />
    </main>
  );
}
