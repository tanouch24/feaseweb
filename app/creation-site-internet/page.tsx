import type { Metadata } from "next";
import { CommercialPage } from "@/components/home/CommercialPage";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Création de site internet professionnel | FeaseWeb",
  description:
    "FeaseWeb crée votre site internet professionnel pour votre entreprise, sans frais de création puis 49 €/mois avec hébergement, maintenance et SEO inclus.",
  alternates: { canonical: "/creation-site-internet" },
  openGraph: { title: "Création de site internet professionnel | FeaseWeb", description: "Un site professionnel géré pour votre entreprise, sans frais de création." },
};

export default function CreationSiteInternetPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "Service", name: "Création de site internet FeaseWeb", provider: { "@type": "Organization", name: "FeaseWeb" }, description: "Création et gestion continue d'un site internet professionnel.", areaServed: "France" };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><CommercialPage eyebrow="Création de site internet" title="Un site professionnel pour votre activité, sans avoir à le construire vous-même." intro="Artisan, commerçant, indépendant, profession libérale ou TPE : vous nous parlez de votre activité, puis FeaseWeb prépare un site clair, mobile et prêt à être présenté à vos clients." points={["Structure et design adaptés à votre activité", "Version mobile et mise en ligne", "Hébergement, SSL et maintenance", "Petites modifications courantes prises en charge", "Référencement SEO inclus dans la formule"]} sectionTitle="Vous donnez les informations. Nous faisons le travail." sectionBody="Le parcours commence par quelques questions sur votre entreprise. Lorsque le dossier est qualifié, FeaseWeb peut préparer une preview pour que vous découvriez la direction du site avant sa mise en ligne définitive." secondaryLink={{ label: "Voir comment ça marche", href: "/comment-ca-marche" }} /><FinalCTA /></>;
}
