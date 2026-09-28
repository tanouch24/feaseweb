import Link from "next/link";
import { CTAButton } from "@/components/ui/CTAButton";

type LandingSection = {
  title: string;
  body: string;
  points?: string[];
};

type ManagedServiceLandingProps = {
  eyebrow: string;
  title: string;
  intro: string;
  highlights: string[];
  sections: LandingSection[];
  relatedLinks: { label: string; href: string }[];
};

export function ManagedServiceLanding({
  eyebrow,
  title,
  intro,
  highlights,
  sections,
  relatedLinks,
}: ManagedServiceLandingProps) {
  return (
    <main>
      <section className="bg-bg-alt py-20 md:py-28">
        <div className="mx-auto grid min-w-0 w-full max-w-6xl gap-12 px-6 md:grid-cols-[1.15fr_.85fr] md:items-end">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl break-words font-serif text-4xl leading-tight text-ink md:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {intro}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <CTAButton href="/creer-mon-site">Créer mon site</CTAButton>
              <Link className="text-sm font-medium text-brand-dark hover:text-brand" href="/contact">
                Parler de mon projet →
              </Link>
            </div>
          </div>
          <aside className="min-w-0 border-l-2 border-brand bg-white p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-ink-soft">
              Une seule formule
            </p>
            <p className="mt-4 font-serif text-5xl text-brand-dark">49 €</p>
            <p className="text-ink-soft">/ mois, tout compris</p>
            <p className="mt-5 text-sm text-ink-soft">
              0 € de frais de création. Hébergement, maintenance et référencement SEO inclus.
            </p>
          </aside>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">
            Ce que vos visiteurs doivent comprendre
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((highlight) => (
              <li key={highlight} className="border-t-2 border-brand pt-4 text-ink-soft">
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="border-t border-line py-20 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[.8fr_1.2fr]">
            <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
              {section.title}
            </h2>
            <div>
              <p className="max-w-2xl leading-relaxed text-ink-soft">{section.body}</p>
              {section.points && (
                <ul className="mt-6 grid gap-3">
                  {section.points.map((point) => (
                    <li key={point} className="border-b border-line py-3 text-ink-soft">
                      <span className="mr-3 text-brand">✓</span>{point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      ))}

      <section className="border-t border-line py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm text-ink-soft">Pour continuer</p>
          <nav className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {relatedLinks.map((link) => (
              <Link key={link.href} className="font-medium text-brand-dark hover:text-brand" href={link.href}>
                {link.label} →
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
