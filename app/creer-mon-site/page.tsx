import { DemoLeadForm } from "@/components/home/DemoLeadForm";

export default function CreerMonSitePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">
        On part de zéro
      </p>
      <h1 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
        Parlez-nous de votre entreprise
      </h1>
      <p className="mt-4 text-ink-soft">
        Quelques informations suffisent pour démarrer. C&apos;est gratuit : la
        création de votre site n&apos;a aucun frais initial.
      </p>
      <div className="mt-10">
        <DemoLeadForm mode="create" />
      </div>
    </main>
  );
}
