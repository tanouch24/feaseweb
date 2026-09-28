import type { Metadata } from "next";
import { KineticWords } from "@/components/home/KineticWords";
import { OfferSection } from "@/components/home/OfferSection";
import { ServiceEditorialGrid } from "@/components/home/ServiceEditorialGrid";
import { FinalCTA } from "@/components/home/FinalCTA";
import { RelatedLinks } from "@/components/home/RelatedLinks";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Tarif site internet : 0 € puis 49 €/mois | FeaseWeb",
  description:
    "Le tarif FeaseWeb : 0 € de création ou de refonte, puis 49 €/mois pour un site, l’hébergement, la maintenance, la sécurité et le SEO.",
  path: "/tarifs",
});

export default function TarifsPage() {
  return (
    <main>
      <RevealOnScroll>
        <KineticWords />
      </RevealOnScroll>
      <OfferSection headingLevel="h1" heading="Un site internet professionnel à 49 €/mois, tout compris." />
      <RevealOnScroll>
        <ServiceEditorialGrid />
      </RevealOnScroll>
      <RelatedLinks links={[{ label: "Site internet pour artisan", href: "/site-internet-artisan" }, { label: "Maintenance du site internet", href: "/maintenance-site-internet" }]} />
      <FinalCTA />
    </main>
  );
}
