import type { Metadata } from "next";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { ComparisonBlock } from "@/components/home/ComparisonBlock";
import { FinalCTA } from "@/components/home/FinalCTA";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Création de site internet : comment ça marche | FeaseWeb",
  description:
    "Découvrez les étapes de création d’un site internet géré : brief, conception, validation, mise en ligne et maintenance par FeaseWeb.",
  path: "/comment-ca-marche",
});

export default function CommentCaMarchePage() {
  return (
    <main>
      <ProcessSteps headingLevel="h1" />
      <RevealOnScroll>
        <ComparisonBlock />
      </RevealOnScroll>
      <FinalCTA />
    </main>
  );
}
