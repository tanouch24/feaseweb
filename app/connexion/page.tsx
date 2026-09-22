import type { Metadata } from "next";
import { ConnexionForm } from "@/components/layout/ConnexionForm";

export const metadata: Metadata = {
  title: "Connexion — Espace client FeaseWeb",
  description: "Connexion à votre espace client FeaseWeb.",
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-serif text-3xl text-ink">Connexion</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Démonstration — aucune authentification réelle.
      </p>
      <ConnexionForm />
    </main>
  );
}
