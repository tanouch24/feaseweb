import type { Metadata } from "next";
import Link from "next/link";
import { SiteCostCalculator } from "@/components/seo/SiteCostCalculator";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo-metadata";
import { siteUrl } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata({
  title: "Calculateur coût site internet sur 3 ans | FeaseWeb",
  description: "Calculez le coût total d’un site internet sur 1, 2, 3 ou 5 ans selon la création, l’hébergement, la maintenance, le SEO et l’abonnement.",
  path: "/calculateur-cout-site-internet",
});

const faq = [
  { question: "Pourquoi calculer le coût sur plusieurs années ?", answer: "Le prix d’un site ne se limite pas à sa création. Une projection fait apparaître séparément le coût initial et les dépenses récurrentes : domaine, hébergement, maintenance, SEO, support ou abonnement." },
  { question: "Les scénarios proposés sont-ils des prix moyens ?", answer: "Non. Les scénarios DIY, freelance, agence et service géré sont des exemples modifiables, à compléter avec les valeurs réellement proposées ou envisagées. Le calculateur ne fournit pas de moyenne de marché." },
  { question: "Que comprend l’exemple FeaseWeb ?", answer: "L’exemple FeaseWeb reprend l’offre de 49 €/mois, sans frais de création ou de refonte, avec hébergement, maintenance, sécurité, SEO, suivi et petites modifications encadrées inclus. Sur trois ans, le calcul est de 49 × 36, soit 1 764 €." },
];

export default function CostCalculatorPage() {
  const pageUrl = new URL("/calculateur-cout-site-internet", siteUrl).toString();
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: "Calculateur de coût d’un site internet", url: pageUrl, applicationCategory: "BusinessApplication", operatingSystem: "Web", inLanguage: "fr-FR", description: "Outil pour projeter le coût total d’un site internet selon plusieurs scénarios et durées." },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Accueil", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Calculateur coût site internet", item: pageUrl }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-14 md:py-20">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Calculateur coût site internet", href: "/calculateur-cout-site-internet" }]} />
      {jsonLd.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <header className="mt-10 max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">Coût total d’un site internet</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-ink md:text-6xl">Combien peut coûter votre site internet sur 3 ans ?</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">Comparez plusieurs scénarios en séparant le coût de création et les dépenses récurrentes. Les valeurs restent modifiables : utilisez vos devis, vos hypothèses ou l’offre que vous étudiez.</p>
      </header>
      <SiteCostCalculator />
      <section className="mt-20 max-w-4xl" aria-labelledby="understanding-cost">
        <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">Comprendre le résultat</p>
        <h2 id="understanding-cost" className="mt-3 font-serif text-3xl text-ink">Le coût d’un site ne se résume pas à sa création</h2>
        <div className="mt-6 space-y-5 text-ink-soft leading-relaxed">
          <p>Un devis peut afficher un coût initial, puis laisser certaines dépenses à prévoir dans le temps. Le domaine, l’hébergement, la maintenance, la sécurité, le SEO, les évolutions et le support doivent être identifiés avant de comparer deux solutions.</p>
          <h3 className="font-serif text-2xl text-ink">Coût initial et coûts récurrents</h3>
          <p>Un coût initial élevé ne permet pas à lui seul de conclure qu’une solution est plus chère. À l’inverse, un abonnement ne doit pas être comparé sans regarder ce qu’il inclut réellement. Le bon périmètre dépend de votre projet, de votre autonomie et du niveau de gestion attendu.</p>
          <h3 className="font-serif text-2xl text-ink">Les postes à clarifier</h3>
          <ul className="grid gap-3">
            <li><strong className="text-ink">Domaine et hébergement :</strong> vérifiez qui les administre, ce qui est inclus et ce qui se passe en cas de changement de prestataire.</li>
            <li><strong className="text-ink">Maintenance et sécurité :</strong> demandez quelles mises à jour, sauvegardes et interventions sont réellement couvertes.</li>
            <li><strong className="text-ink">SEO et suivi :</strong> distinguez les fondations techniques, le suivi des signaux disponibles et les prestations complémentaires éventuelles.</li>
            <li><strong className="text-ink">Évolutions et support :</strong> faites préciser la limite des petites modifications et le traitement des demandes hors périmètre.</li>
            <li><strong className="text-ink">Temps passé :</strong> le calculateur ne monétise pas votre temps. Il vous aide toutefois à ne pas oublier le temps nécessaire pour créer, administrer et maintenir vous-même le site.</li>
          </ul>
          <h3 className="font-serif text-2xl text-ink">Questions à poser avant de signer</h3>
          <p>Qui possède le domaine et les contenus ? Quel est le coût initial exact ? Quel abonnement ou quelles dépenses annuelles sont prévues ? Qui intervient en cas de problème ? Quelles modifications sont incluses ? Quelles sont les règles de sortie ? Ces questions rendent les offres comparables sans inventer un prix de référence.</p>
        </div>
      </section>
      <section className="mt-16 rounded-lg border border-line bg-bg-alt p-6 md:p-8" aria-labelledby="calculator-faq">
        <h2 id="calculator-faq" className="font-serif text-3xl text-ink">Questions fréquentes</h2>
        <div className="mt-6 space-y-6">{faq.map(({ question, answer }) => <div key={question}><h3 className="font-serif text-xl text-ink">{question}</h3><p className="mt-2 leading-relaxed text-ink-soft">{answer}</p></div>)}</div>
      </section>
      <section className="mt-16 border-t border-line pt-10" aria-labelledby="calculator-cta">
        <h2 id="calculator-cta" className="font-serif text-3xl text-ink">Comparer avec une formule gérée</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">Vous pouvez comparer vos hypothèses avec l’offre FeaseWeb : 49 €/mois, sans frais de création ou de refonte, avec hébergement, maintenance, sécurité, SEO, suivi et petites modifications encadrées.</p>
        <div className="mt-6 flex flex-wrap gap-4"><Link href="/tarifs" className="rounded-sm bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand/30">Voir la formule à 49 €/mois</Link><Link href="/contact" className="rounded-sm border border-brand px-5 py-3 text-sm font-medium text-brand-dark hover:bg-bg-alt focus:outline-none focus:ring-2 focus:ring-brand/30">Présenter mon projet</Link></div>
      </section>
      <nav className="mt-14 border-t border-line pt-8" aria-label="Ressources sur le coût d’un site internet"><p className="text-sm font-medium text-ink">Pour approfondir</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">{[
        ["Tarifs FeaseWeb", "/tarifs"], ["Création de site internet", "/creation-site-internet"], ["Maintenance", "/maintenance-site-internet"], ["Prix pour une petite entreprise", "/blog/prix-site-internet-petite-entreprise"], ["Prix d’un site vitrine", "/blog/prix-site-vitrine"], ["Abonnement site internet", "/blog/abonnement-site-internet"], ["Lire un devis", "/blog/devis-site-internet"],
      ].map(([label, href]) => <Link key={href} href={href} className="text-brand-dark underline underline-offset-2 hover:text-brand">{label}</Link>)}</div></nav>
    </main>
  );
}
