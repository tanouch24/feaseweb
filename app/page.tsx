import { Hero } from "@/components/home/Hero";
import { PageLinksGrid } from "@/components/home/PageLinksGrid";
import { FinalCTA } from "@/components/home/FinalCTA";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { ExamplesSection } from "@/components/home/ExamplesSection";
import { TransformationSection } from "@/components/home/TransformationSection";
import { OfferSection } from "@/components/home/OfferSection";
import { SEOSection } from "@/components/home/SEOSection";
import { ModificationFlow } from "@/components/home/ModificationFlow";
import { FAQSection } from "@/components/home/FAQSection";
import { ClientVideos } from "@/components/home/ClientVideos";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata = pageMetadata({
  title: "Création de site internet pour TPE et artisans | FeaseWeb",
  description:
    "FeaseWeb crée ou refait le site internet des artisans, TPE et petites entreprises. 0 € de création, puis 49 €/mois avec hébergement, maintenance et SEO inclus.",
  path: "/",
});

// Accueil volontairement resserré : une idée par section, pas de redite.
// Les questions mises en avant renvoient vers /faq pour le reste.
const HOME_FAQ = [0, 1, 2, 6, 12, 15];

export default function HomePage() {
  return (
    <main>
      <Hero />
      <RevealOnScroll>
        <ProcessSteps />
      </RevealOnScroll>
      <ExamplesSection />
      <ClientVideos />
      <RevealOnScroll>
        <TransformationSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <OfferSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <SEOSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <ModificationFlow />
      </RevealOnScroll>
      <RevealOnScroll>
        <FAQSection only={HOME_FAQ} />
      </RevealOnScroll>
      <RevealOnScroll>
        <PageLinksGrid />
      </RevealOnScroll>
      <FinalCTA />
    </main>
  );
}
