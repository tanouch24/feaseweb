import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ConnexionForm } from "@/components/layout/ConnexionForm";
import { getAuthenticatedProfile } from "@/lib/authz";

export const metadata: Metadata = {
  title: "Connexion — Espace client FeaseWeb",
  description: "Connexion à votre espace client FeaseWeb.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ConnexionPage() {
  const current = await getAuthenticatedProfile();
  if (current.role === "admin") redirect("/admin");
  if (current.role === "client") redirect("/espace-client");
  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-serif text-3xl text-ink">Connexion</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Connectez-vous à votre espace FeaseWeb.
      </p>
      <ConnexionForm />
      <div className="mt-4 text-center"><Link href="/mot-de-passe-oublie" className="text-sm text-brand underline underline-offset-4">Mot de passe oublié ?</Link></div>
      <div className="mt-10 border-t border-line pt-8 text-center"><p className="text-sm font-medium text-ink">Vous n’avez pas encore d’espace client ?</p><p className="mt-2 text-sm text-ink-soft">Découvrez l’offre FeaseWeb et lancez la création de votre site.</p><Link href="/creer-mon-site" className="mt-4 inline-flex rounded-sm border border-brand px-5 py-2.5 text-sm font-medium text-brand">Créer mon site</Link></div>
    </main>
  );
}
