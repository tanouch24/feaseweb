import type { Metadata } from "next";
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
    </main>
  );
}
