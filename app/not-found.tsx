/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-start justify-center px-6 py-20">
      <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">FeaseWeb</p>
      <h1 className="mt-4 font-serif text-5xl text-ink">Cette page n'existe pas.</h1>
      <p className="mt-5 max-w-md text-ink-soft">Le lien a peut-être changé. Revenez à l'accueil ou parlez-nous de votre projet.</p>
      <Link href="/" className="mt-8 rounded-sm bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-dark">Retour à l'accueil →</Link>
    </main>
  );
}
