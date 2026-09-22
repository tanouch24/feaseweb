import { DemoLeadForm } from "@/components/home/DemoLeadForm";

export default function RefaireMonSitePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">
        On peut faire beaucoup mieux
      </p>
      <h1 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
        Parlez-nous de votre site actuel
      </h1>
      <p className="mt-4 text-ink-soft">
        Donnez-nous l&apos;adresse de votre site aujourd&apos;hui : nous
        préparons sa refonte, avec la même formule à 49 €/mois.
      </p>
      <div className="mt-10">
        <DemoLeadForm mode="redesign" />
      </div>
    </main>
  );
}
