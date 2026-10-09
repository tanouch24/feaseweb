import { SectionHeading } from "@/components/ui/SectionHeading";
import { MockupFrame } from "@/components/ui/MockupFrame";
import { CheckIcon } from "@/components/ui/icons";

const foundations = [
  "Structure des pages et titres utiles",
  "Descriptions et contenus compréhensibles",
  "Indexation, sitemap et liens internes",
  "Données structurées pertinentes",
  "Performance et affichage mobile",
  "Points de visibilité à observer dans le temps",
];

function GoogleSnippetMockup() {
  return (
    <MockupFrame>
      <div className="rounded-md border border-line bg-white p-5 shadow-sm">
        <p className="text-[11px] text-ink-soft">Résultat de recherche — illustration</p>
        <div className="mt-3">
          <p className="text-sm text-ink-soft">dupont-plomberie.fr</p>
          <p className="mt-1 text-lg text-blue-700">
            Dupont Plomberie — Dépannage plomberie à Lyon
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Intervention rapide 7j/7, devis gratuit. Plombier agréé,
            disponible pour toutes vos urgences.
          </p>
        </div>
      </div>
    </MockupFrame>
  );
}

export function SEOSection({ headingLevel = "h2", heading = "Un beau site ne suffit pas. Il faut aussi qu'on puisse le trouver.", detailed = false }: { headingLevel?: "h1" | "h2"; heading?: string; detailed?: boolean }) {
  return (
    <section id="seo" className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <SectionHeading title={heading} level={headingLevel} />
            <p className="mt-4 max-w-xl text-ink-soft">
              Le référencement naturel est inclus dans l’abonnement : FeaseWeb
              travaille les fondations techniques et éditoriales de votre site,
              puis les fait évoluer avec votre activité.
            </p>
            <ul className="mt-8 grid gap-3">
              {foundations.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-ink-soft"
                >
                  <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <GoogleSnippetMockup />
        </div>

        <p className="mt-14 text-center font-serif text-2xl text-brand-dark md:text-3xl">
          Le référencement est compris. Pas ajouté en option.
        </p>
      </div>
      {detailed && (
        <div className="mx-auto mt-20 max-w-6xl space-y-20 border-t border-line px-6 pt-20 md:mt-28 md:pt-24">
          <section>
            <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">Qu’est-ce que le référencement naturel ?</h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-ink-soft">Le référencement naturel, ou SEO, regroupe les actions qui aident les moteurs de recherche à comprendre un site et ses pages. Il s’agit de rendre les informations accessibles, cohérentes et utiles pour les personnes qui recherchent un service.</p>
          </section>
          <section>
            <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">Ce que FeaseWeb optimise sur votre site</h2>
            <ul className="mt-8 grid gap-3 text-ink-soft sm:grid-cols-2">
              {["Structure des pages et hiérarchie des titres", "Titles et descriptions adaptés à chaque page", "Contenus liés à vos services réels", "Performances et affichage sur mobile", "Maillage interne entre les pages utiles", "Données structurées quand elles décrivent le contenu visible", "Sitemap et règles d’indexation", "Fondations techniques à maintenir dans le temps"].map((item) => <li key={item} className="border-b border-line py-3"><span className="mr-3 text-brand">✓</span>{item}</li>)}
            </ul>
          </section>
          <section>
            <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">SEO local pour les artisans et TPE</h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-ink-soft">Pour une activité locale, le site doit expliquer clairement le métier, les prestations et la zone géographique desservie. Les informations de l’entreprise doivent rester cohérentes entre le site et les autres présences locales. Une fiche Google Business Profile peut être un levier séparé et pertinent, mais elle doit être créée, vérifiée et gérée selon les règles du service.</p>
            <ul className="mt-6 grid gap-3 text-ink-soft sm:grid-cols-3"><li className="border-t-2 border-brand pt-3">Zone d’intervention</li><li className="border-t-2 border-brand pt-3">Services réellement proposés</li><li className="border-t-2 border-brand pt-3">Coordonnées cohérentes</li></ul>
          </section>
          <section>
            <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">Ce que signifie « SEO inclus »</h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-ink-soft">SEO inclus signifie que les fondations de référencement font partie du service et ne sont pas ajoutées comme une option distincte. Cela ne signifie pas une première position garantie, un trafic garanti, des leads garantis ou des ventes garanties.</p>
          </section>
          <section>
            <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">Comment le référencement progresse dans le temps</h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-ink-soft">Les résultats peuvent évoluer selon le secteur, la concurrence, l’historique du domaine, la qualité des pages et les recherches locales. FeaseWeb peut améliorer progressivement les contenus et les fondations du site ; aucun calendrier ni résultat précis ne peut être promis à l’avance.</p>
          </section>
          <section>
            <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">Ce que FeaseWeb suit</h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-ink-soft">Lorsque les données Google Search Console sont accessibles, FeaseWeb peut suivre les impressions, les clics, le CTR, la position moyenne, les requêtes, les pages visibles et l’indexation. Le sitemap et les erreurs techniques pertinentes peuvent également être contrôlés selon les outils disponibles sur le projet.</p>
            <p className="mt-4 max-w-3xl leading-relaxed text-ink-soft">Ces données servent à repérer les pages à améliorer et les requêtes qui commencent à générer de la visibilité. Elles ne garantissent ni une position, ni un trafic, ni un nombre de prospects ou de ventes.</p>
          </section>
          <section>
            <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">Questions fréquentes</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {[{ question: "Le SEO local garantit-il une place sur Google ?", answer: "Non. Il améliore les fondations du site et la compréhension de l’activité, sans garantir une position." }, { question: "Le référencement est-il une option ?", answer: "Non. Les fondations SEO sont incluses dans la formule FeaseWeb à 49 €/mois." }, { question: "Faut-il une fiche Google Business Profile ?", answer: "Elle peut être utile pour une activité locale, mais elle reste un outil distinct du site et doit être gérée avec des informations exactes." }, { question: "Quand voit-on les effets du SEO ?", answer: "Le délai varie selon le secteur, le site et la concurrence. Aucun délai ou volume de trafic n’est garanti." }].map((item) => <div key={item.question} className="border-t-2 border-brand pt-4"><h3 className="font-medium text-ink">{item.question}</h3><p className="mt-2 text-ink-soft">{item.answer}</p></div>)}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
