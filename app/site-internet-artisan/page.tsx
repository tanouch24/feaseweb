import type { Metadata } from "next";
import { FinalCTA } from "@/components/home/FinalCTA";
import { ManagedServiceLanding } from "@/components/home/ManagedServiceLanding";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Site internet pour artisan : création et gestion | FeaseWeb",
  description:
    "Création d’un site internet pour artisan avec prestations, zone d’intervention, téléphone, demande de devis, affichage mobile, maintenance et SEO inclus.",
  path: "/site-internet-artisan",
});

export default function SiteInternetArtisanPage() {
  return (
    <>
      <ManagedServiceLanding
        eyebrow="Site internet pour artisan"
        title="Un site professionnel pour votre activité artisanale, sans avoir à vous en occuper."
        intro="Plombier, électricien, couvreur, chauffagiste ou artisan du bâtiment : FeaseWeb présente votre savoir-faire avec un site clair, adapté au mobile et géré dans la durée."
        highlights={[
          "Vos prestations visibles en quelques secondes",
          "Votre zone d’intervention clairement présentée",
          "Un appel ou une demande de devis facile",
          "Un site lisible sur téléphone",
        ]}
        sections={[
          {
            title: "Un site qui commence par les besoins de vos clients",
            body: "Un visiteur veut rapidement comprendre ce que vous faites, où vous intervenez et comment vous joindre. La page d’accueil et les rubriques du site donnent la priorité à ces informations, sans demander au client de chercher.",
            points: [
              "Prestations et spécialités expliquées simplement",
              "Zone d’intervention et coordonnées faciles à trouver",
              "Boutons d’appel, de contact ou de demande de devis",
            ],
          },
          {
            title: "Des bases solides pour votre visibilité locale",
            body: "Le site présente clairement votre métier et votre secteur d’intervention afin d’aider les visiteurs et les moteurs de recherche à comprendre votre activité. Cela peut compléter une fiche Google Business Profile cohérente, lorsque cet outil est pertinent pour votre activité. FeaseWeb travaille ces fondations sans promettre une position précise sur Google.",
            points: [
              "Structure adaptée à une petite entreprise locale",
              "Contenu organisé autour de vos services réels",
              "Informations cohérentes avec votre présence locale",
              "Référencement naturel inclus dans l’abonnement",
            ],
          },
          {
            title: "Que doit contenir un bon site internet d’artisan ?",
            body: "Un bon site répond rapidement aux questions d’un client potentiel. Il montre votre métier, vos prestations et votre zone d’intervention, puis facilite le contact depuis un téléphone. Cette base doit rester claire et exacte quand l’activité évolue.",
            points: [
              "Un numéro de téléphone visible et utilisable sur mobile",
              "Une demande de devis ou un formulaire simple",
              "Des prestations décrites avec des mots compréhensibles",
              "Une zone d’intervention précise",
              "Des photos réelles de vos réalisations, si vous en disposez",
              "Des avis uniquement s’ils sont authentiques et vérifiables",
              "Des informations cohérentes avec votre fiche Google Business Profile",
            ],
          },
          {
            title: "Un service géré, pas un outil à administrer",
            body: "Vous fournissez les informations sur votre activité et vos priorités. FeaseWeb prépare le site, le met en ligne et continue de s’en occuper : hébergement, sécurité, maintenance et petites modifications raisonnables sont compris dans la formule.",
            points: [
              "0 € de frais de création selon l’offre actuelle",
              "49 €/mois avec hébergement, SSL et maintenance inclus",
              "Accompagnement après la mise en ligne",
            ],
          },
          {
            title: "Créer un site ne suffit pas : il faut le maintenir",
            body: "Une adresse, une prestation, une photo ou une zone d’intervention peuvent changer. Un site internet d’artisan doit rester à jour, accessible sur mobile et cohérent avec les informations utilisées localement.",
            points: [
              "Informations de contact et horaires à actualiser",
              "Prestations et zone d’intervention à maintenir cohérentes",
              "Suivi technique et petites modifications dans la durée",
              "Fondations SEO et maillage à conserver lisibles",
            ],
          },
        ]}
        relatedLinks={[
          { label: "Voir l’offre et le tarif", href: "/tarifs" },
          { label: "Découvrir la création de site", href: "/creation-site-internet" },
          { label: "Comprendre le référencement inclus", href: "/seo" },
          { label: "Utiliser la checklist pour préparer votre site", href: "/checklist-site-internet-artisan" },
        ]}
      />
      <FinalCTA />
    </>
  );
}
