import { Hero } from "@/components/home/Hero";
import { BreakSection } from "@/components/home/BreakSection";
import { TwoPathsCards } from "@/components/home/TwoPathsCards";
import { PageLinksGrid } from "@/components/home/PageLinksGrid";
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
        <PageLinksGrid />
      </RevealOnScroll>
      <FinalCTA />
    </main>
  );
}
