import Link from "next/link";
import { CTAButton } from "@/components/ui/CTAButton";

type CommercialPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  points: string[];
  sectionTitle: string;
  sectionBody: string;
  secondaryLink?: { label: string; href: string };
};

export function CommercialPage({
  eyebrow,
  title,
  intro,
  points,
  sectionTitle,
  sectionBody,
  secondaryLink,
}: CommercialPageProps) {
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
              {secondaryLink && (
                <Link className="text-sm font-medium text-brand-dark hover:text-brand" href={secondaryLink.href}>
                  {secondaryLink.label} →
                </Link>
              )}
            </div>
          </div>
          <aside className="min-w-0 border-l-2 border-brand bg-white p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-ink-soft">
              Une seule formule
            </p>
            <p className="mt-4 font-serif text-5xl text-brand-dark">49 €</p>
            <p className="text-ink-soft">/ mois, tout compris</p>
            <p className="mt-5 text-sm text-ink-soft">
              0 € de frais de création. Le référencement SEO est inclus.
            </p>
          </aside>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-start">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">
              Ce que FeaseWeb prend en charge
            </p>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">{sectionTitle}</h2>
            <p className="mt-5 max-w-xl text-ink-soft">{sectionBody}</p>
          </div>
          <ul className="grid gap-3">
            {points.map((point) => (
              <li key={point} className="border-b border-line py-3 text-ink-soft">
                <span className="mr-3 text-brand">✓</span>{point}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
