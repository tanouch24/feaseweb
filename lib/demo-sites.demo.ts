export type DemoSite = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
};

export const demoSites: DemoSite[] = [
  {
    slug: "dupont-plomberie",
    name: "Dupont Plomberie",
    category: "Artisan",
    tagline: "Dépannage 7j/7 dans tout le secteur",
    description:
      "Un site clair pour un plombier indépendant : services, zone d'intervention et devis en un clic.",
  },
  {
    slug: "atelier-toiture",
    name: "Atelier Toiture",
    category: "Couverture & rénovation",
    tagline: "Rénovation de toiture et zinguerie",
    description:
      "Mise en avant des réalisations et des certifications, avec une prise de contact simplifiée.",
  },
  {
    slug: "maison-eclat",
    name: "Maison Éclat",
    category: "Beauté & bien-être",
    tagline: "Institut de beauté et soins du visage",
    description:
      "Un univers doux et soigné, pensé pour la prise de rendez-vous en ligne.",
  },
  {
    slug: "cabinet-horizon",
    name: "Cabinet Horizon",
    category: "Profession libérale",
    tagline: "Conseil et accompagnement professionnel",
    description:
      "Un site sobre et rassurant pour un cabinet de conseil, orienté prise de rendez-vous.",
  },
];
