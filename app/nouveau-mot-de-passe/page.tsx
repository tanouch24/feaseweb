import type { Metadata } from "next";
import Link from "next/link";
import { getAuthenticatedProfile } from "@/lib/authz";
import { NewPasswordForm } from "@/components/layout/PasswordResetForm";

export const metadata: Metadata = { title: "Nouveau mot de passe — FeaseWeb", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewPasswordPage() {
  const current = await getAuthenticatedProfile();
  const valid = current.user && (current.role === "client" || current.role === "admin");
  return <main className="mx-auto max-w-sm px-6 py-24"><h1 className="font-serif text-3xl text-ink">Choisissez votre nouveau mot de passe</h1><p className="mt-2 text-sm text-ink-soft">Utilisez un nouveau mot de passe pour sécuriser votre espace FeaseWeb.</p>{valid ? <NewPasswordForm /> : <div className="mt-8 rounded-sm border border-line bg-bg-alt p-4 text-sm text-ink-soft" role="alert">Ce lien est invalide ou expiré. Demandez un nouveau lien depuis la page de connexion.</div>}<p className="mt-8 text-center text-sm"><Link href="/connexion" className="text-brand underline underline-offset-4">Retour à la connexion</Link></p></main>;
}
