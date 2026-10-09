import type { Metadata } from "next";
import { DemoLeadForm } from "@/components/home/DemoLeadForm";
import { SignupAside } from "@/components/onboarding/SignupAside";

export const metadata: Metadata = {
  title: "Refaire mon site — Refonte sans frais | FeaseWeb",
  description:
    "Donnez-nous l'adresse de votre site actuel : FeaseWeb prépare sa refonte, sans frais, avec la même formule à 49 €/mois.",
  alternates: { canonical: "/refaire-mon-site" },
  robots: { index: false, follow: false },
};

export default function RefaireMonSitePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14 md:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-brand">Refonte de site</p>
          <h1 className="mt-2 font-serif text-[2.2rem] leading-[1.05] text-ink md:text-[3rem]">
            Parlez-nous de votre site actuel
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            Donnez-nous l&apos;adresse de votre site aujourd&apos;hui : nous
            préparons sa refonte, avec la même formule à 49 €/mois.
          </p>
          <div className="mt-10">
            <DemoLeadForm mode="redesign" />
          </div>
        </div>
        <SignupAside mode="redesign" />
      </div>
    </main>
  );
}
