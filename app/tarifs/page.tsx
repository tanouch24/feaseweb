import type { Metadata } from "next";
import { KineticWords } from "@/components/home/KineticWords";
import { OfferSection } from "@/components/home/OfferSection";
import { ServiceEditorialGrid } from "@/components/home/ServiceEditorialGrid";
import { FinalCTA } from "@/components/home/FinalCTA";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export const metadata: Metadata = {
  title: "Tarifs — 0 € de création, puis 49 €/mois tout compris | FeaseWeb",
  description:
    "0 € de frais de création ou de refonte, puis 49 €/mois tout compris : site, hébergement, maintenance, sécurité, modifications et référencement SEO inclus.",
  alternates: { canonical: "/tarifs" },
};

export default function TarifsPage() {
  return (
    <main>
      <RevealOnScroll>
        <KineticWords />
      </RevealOnScroll>
      <OfferSection />
      <RevealOnScroll>
        <ServiceEditorialGrid />
      </RevealOnScroll>
      <FinalCTA />
    </main>
  );
}
