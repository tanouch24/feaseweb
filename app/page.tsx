import { Hero } from "@/components/home/Hero";
import { BreakSection } from "@/components/home/BreakSection";
import { TwoPathsCards } from "@/components/home/TwoPathsCards";
import { PageLinksGrid } from "@/components/home/PageLinksGrid";
import { FinalCTA } from "@/components/home/FinalCTA";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { ExamplesSection } from "@/components/home/ExamplesSection";
import { TransformationSection } from "@/components/home/TransformationSection";
import { OfferSection } from "@/components/home/OfferSection";
import { SEOSection } from "@/components/home/SEOSection";
import { ClientSpaceSection } from "@/components/home/ClientSpaceSection";
import { ModificationFlow } from "@/components/home/ModificationFlow";
import { FAQSection } from "@/components/home/FAQSection";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <RevealOnScroll>
        <BreakSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <TwoPathsCards />
      </RevealOnScroll>
      <RevealOnScroll>
        <ProcessSteps />
      </RevealOnScroll>
      <ExamplesSection />
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
        <ClientSpaceSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <ModificationFlow />
      </RevealOnScroll>
      <RevealOnScroll>
        <FAQSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <PageLinksGrid />
      </RevealOnScroll>
      <FinalCTA />
    </main>
  );
}
