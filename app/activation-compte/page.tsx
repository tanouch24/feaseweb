import type { Metadata } from "next";
import Link from "next/link";
import { getAuthenticatedProfile } from "@/lib/authz";
import { NewPasswordForm } from "@/components/layout/PasswordResetForm";

export const metadata: Metadata = { title: "Activation du compte — FeaseWeb", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountActivationPage() {
  const current = await getAuthenticatedProfile();
  const valid = current.user && current.role === "client";
  return <main className="mx-auto max-w-sm px-6 py-24"><h1 className="font-serif text-3xl text-ink">Activez votre espace client</h1><p className="mt-2 text-sm text-ink-soft">Choisissez votre mot de passe pour accéder à votre espace FeaseWeb.</p>{valid ? <NewPasswordForm submitLabel="Activer mon compte" /> : <div className="mt-8 rounded-sm border border-line bg-bg-alt p-4 text-sm text-ink-soft" role="alert">Ce lien d’activation est invalide ou expiré. Demandez une nouvelle invitation à FeaseWeb.</div>}<p className="mt-8 text-center text-sm"><Link href="/connexion" className="text-brand underline underline-offset-4">Retour à la connexion</Link></p></main>;
}
