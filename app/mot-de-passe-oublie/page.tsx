import type { Metadata } from "next";
import Link from "next/link";
import { PasswordResetRequestForm } from "@/components/layout/PasswordResetForm";

export const metadata: Metadata = { title: "Mot de passe oublié — FeaseWeb", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return <main className="mx-auto max-w-sm px-6 py-24"><h1 className="font-serif text-3xl text-ink">Mot de passe oublié ?</h1><p className="mt-2 text-sm text-ink-soft">Saisissez votre adresse email. Nous vous enverrons un lien pour choisir un nouveau mot de passe.</p><PasswordResetRequestForm /><p className="mt-8 text-center text-sm"><Link href="/connexion" className="text-brand underline underline-offset-4">Retour à la connexion</Link></p></main>;
}
