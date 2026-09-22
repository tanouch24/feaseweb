export type FAQItem = {
  question: string;
  answer: string;
};

export const faqItems: FAQItem[] = [
  {
    question: "Pourquoi la création est-elle à 0 € ?",
    answer:
      "Parce que le vrai produit FeaseWeb est le service géré à 49 €/mois : nous préférons vous laisser juger la qualité du site avant de vous engager, plutôt que de vous faire payer une création que vous n'avez pas encore vue.",
  },
  {
    question: "Que comprennent les 49 €/mois ?",
    answer:
      "Le site, son hébergement, sa sécurité, sa maintenance, les sauvegardes, les petites modifications, le référencement SEO et l'accès à votre espace client. Tout est inclus, il n'y a pas d'option payante en plus.",
  },
  {
    question: "J'ai déjà un site, pouvez-vous le refaire ?",
    answer:
      "Oui. Donnez-nous l'adresse de votre site actuel et nous préparons sa refonte, avec la même formule à 49 €/mois.",
  },
  {
    question: "Le référencement est-il vraiment inclus ?",
    answer:
      "Oui, sans option supplémentaire. Nous travaillons les fondations techniques de votre site et suivons sa visibilité dans le temps, sans jamais promettre un résultat garanti.",
  },
  {
    question: "Puis-je demander des modifications ?",
    answer:
      "Oui, directement depuis votre espace client. Les petites modifications sont incluses dans l'abonnement.",
  },
  {
    question: "Combien de pages sont incluses ?",
    answer: "Jusqu'à 5 pages dans l'abonnement de base.",
  },
  {
    question: "Puis-je utiliser mon propre nom de domaine ?",
    answer:
      "Oui, vous pouvez utiliser un nom de domaine existant ou en obtenir un nouveau avec notre aide.",
  },
  {
    question: "Que se passe-t-il si je souhaite arrêter ?",
    answer:
      "Les modalités de résiliation et de transfert sont définies dans le contrat applicable. Elles seront précisées avant toute souscription.",
  },
];
