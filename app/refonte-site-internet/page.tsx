import type { Metadata } from "next";
import { CommercialPage } from "@/components/home/CommercialPage";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Refonte de site internet | FeaseWeb",
  description:
    "Votre site est ancien, lent ou peu clair ? FeaseWeb prépare sa refonte sans frais de création, puis assure sa maintenance et son référencement.",
  alternates: { canonical: "/refonte-site-internet" },
  openGraph: { title: "Refonte de site internet | FeaseWeb", description: "Un site plus clair, plus actuel et géré dans la durée." },
};

export default function RefonteSiteInternetPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "Service", name: "Refonte de site internet FeaseWeb", provider: { "@type": "Organization", name: "FeaseWeb" }, description: "Refonte et gestion continue d'un site internet professionnel.", areaServed: "France" };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><CommercialPage eyebrow="Refonte de site internet" title="Votre site a vieilli. Votre entreprise, non." intro="Un site non adapté au mobile, lent, difficile à modifier ou peu lisible peut donner une image dépassée de votre activité. FeaseWeb repart de vos besoins pour préparer une version plus claire et plus utile." points={["Audit des informations et des priorités", "Design actuel, lisible et adapté au mobile", "Contenus réorganisés pour vos visiteurs", "Préservation des fondations SEO pertinentes", "Maintenance et petites évolutions dans la durée"]} sectionTitle="Voyez la différence avant de vous engager." sectionBody="Transmettez-nous l'adresse de votre site actuel et les points qui vous gênent. Après qualification du dossier, nous pouvons préparer une proposition ou une preview adaptée à votre activité. Rien n'est généré automatiquement ni promis sans échange." secondaryLink={{ label: "Comparer avant / après", href: "/exemples" }} /><FinalCTA /></>;
}
