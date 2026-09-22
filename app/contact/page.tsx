/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { DemoLeadForm } from "@/components/home/DemoLeadForm";

export const metadata: Metadata = {
  title: "Contact — FeaseWeb",
  description: "Parlez de votre projet de site internet à FeaseWeb.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">Parlons de votre activité</p>
      <h1 className="mt-3 font-serif text-4xl text-ink md:text-5xl">Une question avant de commencer ?</h1>
      <p className="mt-5 text-ink-soft">
        Vous pouvez nous décrire votre besoin ici. Le formulaire est transmis à FeaseWeb lorsqu'une connexion backend est disponible ; aucune donnée n'est stockée dans le navigateur.
      </p>
      <div className="mt-8 rounded-md border border-line bg-bg-alt p-5 text-sm text-ink-soft">
        Pour un projet précis, le parcours <Link className="font-medium text-brand-dark" href="/creer-mon-site">Créer mon site</Link> permet de nous donner les informations les plus utiles dès le départ.
      </div>
      <div className="mt-10"><DemoLeadForm mode="create" /></div>
    </main>
  );
}
