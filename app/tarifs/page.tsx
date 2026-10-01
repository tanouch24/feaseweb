import type { Metadata } from "next";
import { KineticWords } from "@/components/home/KineticWords";
import { OfferSection } from "@/components/home/OfferSection";
import { ServiceEditorialGrid } from "@/components/home/ServiceEditorialGrid";
import { FinalCTA } from "@/components/home/FinalCTA";
import { RelatedLinks } from "@/components/home/RelatedLinks";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Tarif site internet : 0 € puis 49 €/mois | FeaseWeb",
  description:
    "Le tarif FeaseWeb : 0 € de création ou de refonte, puis 49 €/mois pour un site, l’hébergement, la maintenance, la sécurité et le SEO.",
  path: "/tarifs",
});

export default function TarifsPage() {
  return (
    <main>
      <RevealOnScroll>
        <KineticWords />
      </RevealOnScroll>
      <OfferSection headingLevel="h1" heading="Un site internet professionnel à 49 €/mois, tout compris." />
      <RevealOnScroll>
        <ServiceEditorialGrid />
      </RevealOnScroll>
      <section className="border-t border-line py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-widest text-brand-dark">Prix site internet</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-ink md:text-4xl">Le prix d’un site internet, expliqué simplement</h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Le modèle FeaseWeb sépare les frais de création de l’accompagnement dans la durée :
              la création ou la refonte est proposée sans frais de création, puis l’abonnement est de
              49 €/mois pour le site géré.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-md border border-line bg-white p-6">
              <h3 className="font-serif text-2xl text-ink">Ce qui est inclus</h3>
              <ul className="mt-5 grid gap-3 text-ink-soft">
                {["Création ou refonte sans frais de création", "Hébergement et certificat HTTPS", "Affichage responsive sur mobile", "Formulaire et moyens de contact", "Maintenance, sécurité de base et sauvegardes", "Référencement naturel inclus", "Petites modifications raisonnables", "Support dans le cadre du service géré"].map((item) => (
                  <li key={item} className="border-b border-line py-2"><span className="mr-3 text-brand">✓</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-line bg-bg-alt p-6">
              <h3 className="font-serif text-2xl text-ink">Les limites à connaître</h3>
              <ul className="mt-5 grid gap-3 text-ink-soft">
                <li>Le périmètre est clarifié avant le démarrage et tous les projets ne sont pas acceptés automatiquement.</li>
                <li>Les demandes importantes ou hors périmètre doivent être précisées avant réalisation.</li>
                <li>Le SEO inclus ne garantit ni position, ni trafic, ni leads, ni ventes.</li>
                <li>Les règles de résiliation et de propriété doivent être vérifiées dans les documents contractuels applicables.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t border-line bg-bg-alt py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">Comparer les modèles de création de site</h2>
            <p className="mt-5 leading-relaxed text-ink-soft">Cette comparaison porte sur le mode d’accompagnement, pas sur des prix moyens de marché qui ne sont pas établis ici.</p>
          </div>
          <div className="mt-10 overflow-x-auto rounded-md border border-line bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-bg-alt text-ink">
                <tr><th className="px-5 py-4 font-medium">Modèle</th><th className="px-5 py-4 font-medium">Vous gérez principalement</th><th className="px-5 py-4 font-medium">Accompagnement</th></tr>
              </thead>
              <tbody className="divide-y divide-line text-ink-soft">
                <tr><th className="px-5 py-4 font-medium text-ink">Agence classique</th><td className="px-5 py-4">Un projet souvent cadré et facturé séparément</td><td className="px-5 py-4">Variable selon le contrat</td></tr>
                <tr><th className="px-5 py-4 font-medium text-ink">Freelance</th><td className="px-5 py-4">Le projet et les évolutions à organiser</td><td className="px-5 py-4">Dépend de la disponibilité et du périmètre</td></tr>
                <tr><th className="px-5 py-4 font-medium text-ink">Constructeur DIY</th><td className="px-5 py-4">La création, les réglages et la maintenance</td><td className="px-5 py-4">Outil, documentation ou support éditeur</td></tr>
                <tr><th className="px-5 py-4 font-medium text-ink">FeaseWeb</th><td className="px-5 py-4">Vos informations et vos demandes utiles</td><td className="px-5 py-4">Création, mise en ligne et gestion dans la durée</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <RelatedLinks links={[{ label: "Site internet pour artisan", href: "/site-internet-artisan" }, { label: "Maintenance du site internet", href: "/maintenance-site-internet" }]} />
      <FinalCTA />
    </main>
  );
}
