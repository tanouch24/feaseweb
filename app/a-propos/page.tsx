/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos de FeaseWeb",
  description: "FeaseWeb, un service français de sites internet gérés pour les petites entreprises.",
  alternates: { canonical: "/a-propos" },
};

export default function AProposPage() {
  return (
    <main>
      <section className="bg-bg-alt py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">À propos</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-ink md:text-6xl">Un site internet utile, sans une nouvelle tâche à gérer.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">FeaseWeb est un service français pensé pour les artisans, commerçants, indépendants, professions libérales et petites entreprises qui veulent une présence en ligne sérieuse sans apprendre à construire un site.</p>
        </div>
      </section>
      <section className="py-20 md:py-28">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2">
          <div><h2 className="font-serif text-3xl text-ink">Un service géré</h2><p className="mt-4 text-ink-soft">Vous partagez vos informations, vos priorités et vos retours. FeaseWeb s'occupe de la création, de la mise en ligne, de la maintenance, des petites modifications et du référencement inclus.</p></div>
          <div><h2 className="font-serif text-3xl text-ink">Une relation simple</h2><p className="mt-4 text-ink-soft">Pas de promesse de position Google, pas de faux résultats, pas de chiffres inventés. Le site et son suivi sont travaillés au fil de votre activité, avec un espace client pour suivre les prochaines étapes.</p></div>
        </div>
        <div className="mx-auto mt-12 max-w-5xl px-6"><Link href="/creer-mon-site" className="inline-flex rounded-sm bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-dark">Parler de mon projet →</Link></div>
      </section>
    </main>
  );
}
