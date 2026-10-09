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
    body: "Quatre démonstrations de métiers différents pour voir l'approche FeaseWeb avant de parler de votre projet.",
  },
  {
    href: "/seo",
    Icon: ChartIcon,
    title: "Référencement",
    body: "Le SEO est inclus dans l'abonnement, jamais ajouté en option.",
  },
  {
    href: "/site-internet-artisan",
    Icon: GlobeIcon,
    title: "Site pour artisan",
    body: "Une présentation claire de votre activité, de vos prestations et de votre zone d'intervention.",
  },
  {
    href: "/maintenance-site-internet",
    Icon: SupportIcon,
    title: "Maintenance",
    body: "Hébergement, sécurité, sauvegardes et petites évolutions dans la durée.",
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
    <section className="bg-bg-alt py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading title="Pour aller plus loin" />
        <ul className="mt-10 grid border-t border-line sm:grid-cols-2 sm:gap-x-12 lg:grid-cols-3">
          {links.map((link) => (
            <li key={link.href} className="border-b border-line">
              <Link
                href={link.href}
                className="group flex h-full items-start gap-4 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <link.Icon className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                <span>
                  <span className="block text-[17px] font-semibold text-ink underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-brand">
                    {link.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                    {link.body}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
