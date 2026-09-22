import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  HomeIcon,
  GlobeIcon,
  ChartIcon,
  RequestIcon,
  SupportIcon,
} from "@/components/ui/icons";

const links = [
  {
    href: "/comment-ca-marche",
    Icon: HomeIcon,
    title: "Comment ça marche",
    body: "Quatre étapes, du premier échange à la mise en ligne, puis on s'occupe du reste.",
  },
  {
    href: "/tarifs",
    Icon: RequestIcon,
    title: "Tarif",
    body: "0 € de frais de création ou de refonte, puis 49 €/mois tout compris.",
  },
  {
    href: "/exemples",
    Icon: GlobeIcon,
    title: "Exemples de sites",
    body: "Quatre métiers, quatre sites créés par FeaseWeb — et une démonstration avant/après.",
  },
  {
    href: "/seo",
    Icon: ChartIcon,
    title: "Référencement",
    body: "Le SEO est inclus dans l'abonnement, jamais ajouté en option.",
  },
  {
    href: "/blog",
    Icon: SupportIcon,
    title: "Blog",
    body: "Des conseils pratiques sur le site internet de votre entreprise.",
  },
  {
    href: "/faq",
    Icon: RequestIcon,
    title: "Questions fréquentes",
    body: "Les réponses aux questions les plus posées sur le service FeaseWeb.",
  },
];

export function PageLinksGrid() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Tout ce qu'il faut savoir sur FeaseWeb." />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group block rounded-lg border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <link.Icon className="h-6 w-6 text-brand" />
              <p className="mt-4 font-serif text-lg text-ink">{link.title}</p>
              <p className="mt-2 text-sm text-ink-soft">{link.body}</p>
              <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand-dark">
                Voir
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
