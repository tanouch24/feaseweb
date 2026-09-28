import type { Metadata } from "next";
import { FinalCTA } from "@/components/home/FinalCTA";
import { ManagedServiceLanding } from "@/components/home/ManagedServiceLanding";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Maintenance de site internet gérée | FeaseWeb",
  description:
    "FeaseWeb s’occupe de la maintenance de votre site internet : hébergement, SSL, sécurité, sauvegardes, corrections et petites modifications inclus.",
  path: "/maintenance-site-internet",
});

export default function MaintenanceSiteInternetPage() {
  return (
    <>
      <ManagedServiceLanding
        eyebrow="Maintenance de site internet"
        title="La maintenance de votre site internet, sans avoir à y penser."
        intro="Après la mise en ligne, votre site doit rester accessible, sûr et à jour. FeaseWeb est un service géré : vous n’avez pas à administrer votre site au quotidien."
        highlights={[
          "Hébergement et certificat SSL inclus",
          "Sécurité et sauvegardes suivies",
          "Corrections et petites modifications raisonnables",
          "Un interlocuteur pour faire évoluer le site",
        ]}
        sections={[
          {
            title: "Maintenir un site, ce n’est pas seulement le laisser en ligne",
            body: "La maintenance consiste à suivre ce qui permet au site de rester utile dans le temps : hébergement, sécurité, sauvegardes, corrections et contenu à faire évoluer. Elle aide aussi à éviter qu’un changement d’activité ou de coordonnées rende le site moins clair pour vos visiteurs.",
            points: [
              "Suivi des besoins techniques du site",
              "Prise en compte des corrections nécessaires",
              "Petites modifications raisonnables au fil de l’activité",
            ],
          },
          {
            title: "Ce que la formule FeaseWeb prend en charge",
            body: "La maintenance est incluse dans l’abonnement de 49 €/mois, avec les éléments annoncés dans l’offre. Elle s’inscrit dans un accompagnement continu, sans transformer votre site en tâche quotidienne à gérer vous-même.",
            points: [
              "Hébergement, SSL, sécurité et sauvegardes",
              "Corrections et petites évolutions du site",
              "Référencement naturel et suivi de visibilité inclus",
            ],
          },
          {
            title: "Que se passe-t-il après la mise en ligne ?",
            body: "Vous pouvez nous transmettre les changements utiles à votre activité : service, horaire, texte, image ou information de contact. FeaseWeb examine la demande et réalise les modifications raisonnables prévues par la formule. Pour un besoin plus important, le périmètre est clarifié avant d’agir.",
            points: [
              "Vous restez accompagné après la création ou la refonte",
              "Le site peut évoluer avec votre entreprise",
              "La maintenance reste liée à un service géré, pas à un outil DIY",
            ],
          },
        ]}
        relatedLinks={[
          { label: "Voir le tarif de la formule", href: "/tarifs" },
          { label: "Voir comment ça marche", href: "/comment-ca-marche" },
          { label: "Lire l’article sur l’après mise en ligne", href: "/blog/apres-mise-en-ligne" },
          { label: "Découvrir la création de site", href: "/creation-site-internet" },
          { label: "Découvrir la refonte", href: "/refonte-site-internet" },
        ]}
      />
      <FinalCTA />
    </>
  );
}
