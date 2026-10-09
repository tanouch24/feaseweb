import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo-metadata";
import { siteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Checklist site internet pour artisan | FeaseWeb",
    description:
      "La checklist pratique pour préparer ou refondre le site internet d’un artisan : contenus, contact, mobile, sécurité, SEO local et suivi.",
    path: "/checklist-site-internet-artisan",
  }),
};

const checklistSections = [
  {
    title: "Identité et informations de base",
    items: [
      "Le nom de l’entreprise et son activité sont clairement présentés.",
      "Les coordonnées sont à jour et faciles à trouver.",
      "Les horaires ou modalités de disponibilité sont indiqués.",
      "La zone d’intervention est décrite avec des termes compréhensibles.",
    ],
  },
  {
    title: "Prestations et réassurance",
    items: [
      "Chaque prestation importante est expliquée simplement.",
      "Les photos utilisées sont réelles, autorisées et suffisamment lisibles.",
      "Les avis affichés sont authentiques et vérifiables.",
      "Les éléments de confiance sont cohérents avec l’activité réelle.",
    ],
  },
  {
    title: "Contact et conversion",
    items: [
      "Le numéro de téléphone est visible et utilisable sur mobile.",
      "La demande de devis ou le formulaire reste court et compréhensible.",
      "Les boutons de contact sont placés près des informations utiles.",
      "Le formulaire et les notifications ont été testés.",
    ],
  },
  {
    title: "Mobile et performance",
    items: [
      "Les pages sont lisibles sur un téléphone sans zoom horizontal.",
      "Les boutons et les liens sont suffisamment faciles à utiliser.",
      "Les images sont adaptées au web et disposent de dimensions cohérentes.",
      "Les contenus prioritaires restent accessibles même avec une connexion moyenne.",
    ],
  },
  {
    title: "Domaine, sécurité et obligations",
    items: [
      "Le nom de domaine est enregistré au nom de l’entreprise ou sous son contrôle.",
      "Les accès au domaine, à l’hébergement et au site sont identifiés.",
      "Le HTTPS fonctionne sur les pages principales.",
      "Les mentions légales et la politique de confidentialité sont adaptées au site.",
    ],
  },
  {
    title: "SEO local et suivi",
    items: [
      "Les titres et descriptions correspondent réellement aux pages.",
      "La structure des pages aide à comprendre le métier et les services.",
      "Les informations du site sont cohérentes avec Google Business Profile lorsqu’il est utilisé.",
      "Le sitemap, les canoniques et l’indexation sont vérifiés après la mise en ligne.",
      "Un suivi est prévu pour corriger les informations qui évoluent.",
    ],
  },
] as const;

export default function ChecklistSiteInternetArtisanPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Checklist site internet pour artisan",
    description:
      "Checklist pratique pour préparer ou refondre le site internet d’un artisan.",
    url: new URL("/checklist-site-internet-artisan", siteUrl).toString(),
    author: { "@type": "Organization", name: "FeaseWeb", url: siteUrl },
    publisher: { "@type": "Organization", name: "FeaseWeb", url: siteUrl },
    inLanguage: "fr-FR",
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:py-20">
      <Breadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Site internet pour artisan", href: "/site-internet-artisan" },
          { label: "Checklist", href: "/checklist-site-internet-artisan" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <header className="mt-8 max-w-3xl">
        <p className="text-[15px] font-semibold text-brand-dark">Ressource pratique</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-ink md:text-5xl">
          Checklist site internet pour artisan
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Utilisez cette checklist pour préparer une création ou une refonte de site internet sans oublier les informations, les contacts et les contrôles utiles après la mise en ligne.
        </p>
      </header>

      <section className="mt-10 rounded-lg border border-line bg-bg-alt p-6" aria-labelledby="mode-emploi">
        <h2 id="mode-emploi" className="font-serif text-2xl text-ink">Comment l’utiliser ?</h2>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Parcourez les points avant de transmettre votre projet à un prestataire. Une case non cochée n’est pas un échec : elle indique simplement une question à clarifier avant la mise en ligne.
        </p>
      </section>

      <div className="mt-10 space-y-8">
        {checklistSections.map((section, index) => (
          <section key={section.title} aria-labelledby={`checklist-section-${index}`}>
            <h2 id={`checklist-section-${index}`} className="font-serif text-2xl text-ink">{section.title}</h2>
            <ul className="mt-4 space-y-3">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3 rounded-md border border-line bg-white p-4 leading-relaxed text-ink-soft">
                  <input type="checkbox" aria-label={item} className="mt-1 h-4 w-4 shrink-0 accent-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-12 border-t border-line pt-8" aria-labelledby="apres">
        <h2 id="apres" className="font-serif text-2xl text-ink">Après la mise en ligne</h2>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Un site d’artisan doit rester exact et utilisable : horaires, prestations, zone d’intervention, photos et moyens de contact peuvent évoluer. Prévoyez un responsable et une méthode pour traiter ces changements.
        </p>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Pour approfondir, consultez les conseils sur le <Link href="/site-internet-artisan" className="text-brand-dark underline underline-offset-2">site internet pour artisan</Link>, la <Link href="/creation-site-internet" className="text-brand-dark underline underline-offset-2">création de site professionnel</Link> et la <Link href="/refonte-site-internet" className="text-brand-dark underline underline-offset-2">refonte de site internet</Link>.
        </p>
      </section>

      <aside className="mt-12 rounded-lg border border-brand/20 bg-bg-alt p-6">
        <h2 className="font-serif text-2xl text-ink">Vous préférez déléguer ?</h2>
        <p className="mt-3 leading-relaxed text-ink-soft">FeaseWeb crée et gère des sites pour les artisans et petites entreprises, avec un accompagnement dans la durée.</p>
        <Link href="/creation-site-internet" className="mt-5 inline-block font-semibold text-brand-dark underline underline-offset-4">
          Découvrir la création de site
        </Link>
      </aside>
    </main>
  );
}
