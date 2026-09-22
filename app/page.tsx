import { Hero } from "@/components/home/Hero";
import { BreakSection } from "@/components/home/BreakSection";
import { TwoPathsCards } from "@/components/home/TwoPathsCards";
import { TransformationSection } from "@/components/home/TransformationSection";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { KineticWords } from "@/components/home/KineticWords";
import { OfferSection } from "@/components/home/OfferSection";
import { ComparisonBlock } from "@/components/home/ComparisonBlock";
import { ClientSpaceSection } from "@/components/home/ClientSpaceSection";
import { ExamplesSection } from "@/components/home/ExamplesSection";
import { ServiceEditorialGrid } from "@/components/home/ServiceEditorialGrid";
import { ModificationFlow } from "@/components/home/ModificationFlow";
import { SEOSection } from "@/components/home/SEOSection";
import { FAQSection } from "@/components/home/FAQSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

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
        <TransformationSection />
      </RevealOnScroll>
      {/* Not wrapped in RevealOnScroll: its sticky visual panel needs an
          ancestor with no transform, and the section already carries its
          own scroll-driven motion. */}
      <ProcessSteps />
      <RevealOnScroll>
        <KineticWords />
      </RevealOnScroll>
      <RevealOnScroll>
        <OfferSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <ComparisonBlock />
      </RevealOnScroll>
      <RevealOnScroll>
        <ClientSpaceSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <ExamplesSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <ServiceEditorialGrid />
      </RevealOnScroll>
      <RevealOnScroll>
        <ModificationFlow />
      </RevealOnScroll>
      <RevealOnScroll>
        <SEOSection />
      </RevealOnScroll>
      <RevealOnScroll>
        <FAQSection />
      </RevealOnScroll>
      <FinalCTA />
    </main>
  );
}
