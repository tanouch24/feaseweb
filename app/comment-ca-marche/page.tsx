import type { Metadata } from "next";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { ComparisonBlock } from "@/components/home/ComparisonBlock";
import { FinalCTA } from "@/components/home/FinalCTA";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export const metadata: Metadata = {
  title: "Comment ça marche — FeaseWeb",
  description:
    "De la prise de contact à la mise en ligne : découvrez comment FeaseWeb crée et gère votre site internet, étape par étape.",
  alternates: { canonical: "/comment-ca-marche" },
};

export default function CommentCaMarchePage() {
  return (
    <main>
      <ProcessSteps />
      <RevealOnScroll>
        <ComparisonBlock />
      </RevealOnScroll>
      <FinalCTA />
    </main>
  );
}
