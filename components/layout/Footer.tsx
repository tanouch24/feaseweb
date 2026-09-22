import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

const navLinks = [
  { label: "Comment ça marche", href: "/comment-ca-marche" },
  { label: "Offre", href: "/tarifs" },
  { label: "Exemples", href: "/exemples" },
  { label: "Référencement", href: "/seo" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Espace client", href: "/espace-client" },
  { label: "Contact", href: "/creer-mon-site" },
  { label: "Connexion", href: "/connexion" },
];

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "CGV", href: "/cgv" },
  { label: "Cookies", href: "/cookies" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg-alt">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm text-ink-soft">
              Votre site internet, sans avoir à vous en occuper.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ink-soft hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-xs text-ink-soft md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-ink">
                {link.label}
              </Link>
            ))}
          </div>
          <p>
            © {new Date().getFullYear()} FeaseWeb — [TODO: raison sociale, SIREN,
            adresse, capital social à compléter avant mise en production]
          </p>
        </div>
      </div>
    </footer>
  );
}
