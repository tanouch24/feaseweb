"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { CTAButton } from "@/components/ui/CTAButton";

const navLinks = [
  { label: "Comment ça marche", href: "/#comment-ca-marche" },
  { label: "Tout compris", href: "/#tout-compris" },
  { label: "Exemples", href: "/#exemples" },
  { label: "Tarif", href: "/#tarif" },
  { label: "FAQ", href: "/#faq" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled
          ? "bg-bg/95 backdrop-blur-sm border-line"
          : "bg-bg border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <a href="/connexion" className="text-sm text-ink-soft hover:text-ink">
            Connexion
          </a>
          <CTAButton href="/creer-mon-site">Créer mon site</CTAButton>
        </div>
        <button
          type="button"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="sr-only">Menu</span>
          <div className="flex flex-col gap-1.5">
            <span className="h-0.5 w-5 bg-ink" />
            <span className="h-0.5 w-5 bg-ink" />
          </div>
        </button>
      </div>
      {mobileOpen && (
        <nav
          data-testid="mobile-nav"
          className="flex flex-col gap-4 border-t border-line bg-bg px-6 py-6 md:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-base text-ink"
            >
              {link.label}
            </a>
          ))}
          <a href="/connexion" className="text-base text-ink-soft">
            Connexion
          </a>
          <CTAButton href="/creer-mon-site">Créer mon site</CTAButton>
        </nav>
      )}
    </header>
  );
}
