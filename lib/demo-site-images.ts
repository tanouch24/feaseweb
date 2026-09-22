/**
 * Photography used inside the fictional demo-site mockups (Dupont Plomberie,
 * Atelier Toiture, Maison Éclat, Cabinet Horizon). All sourced from Unsplash
 * under the Unsplash License (free for commercial and non-commercial use,
 * no permission required) — verified directly on unsplash.com before use.
 * Photographer credit kept here even though the license doesn't require
 * attribution, so provenance stays traceable in one place.
 */

export type DemoImage = {
  src: string;
  alt: string;
  photographer: string;
};

export const demoSiteImages = {
  plumbingHero: {
    src: "https://images.unsplash.com/photo-1676210134050-6f12c6898395?q=80&w=1600&auto=format&fit=crop",
    alt: "Plombier intervenant sur une installation sanitaire",
    photographer: "Timur Shakerzianov / Unsplash",
  },
  plumbingDetail: {
    src: "https://images.unsplash.com/photo-1696987007764-7f8b85dd3033?q=80&w=1200&auto=format&fit=crop",
    alt: "Salle de bain moderne avec double vasque et douche",
    photographer: "Clay Banks / Unsplash",
  },
  roofingHero: {
    src: "https://images.unsplash.com/photo-1643225523483-e2c434191bba?q=80&w=1600&auto=format&fit=crop",
    alt: "Couvreur portant des tuiles sur un chantier de toiture",
    photographer: "Zohair Mirza / Unsplash",
  },
  roofingDetail: {
    src: "https://images.unsplash.com/photo-1518736346281-76873166a64a?q=80&w=1200&auto=format&fit=crop",
    alt: "Motif de tuiles de toiture grises vues de près",
    photographer: "Michael Jasmund / Unsplash",
  },
  beautyHero: {
    src: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1600&auto=format&fit=crop",
    alt: "Soin par pierres chaudes dans un institut de beauté",
    photographer: "engin akyurt / Unsplash",
  },
  beautyDetail: {
    src: "https://images.unsplash.com/photo-1598901986949-f593ff2a31a6?q=80&w=1200&auto=format&fit=crop",
    alt: "Soin du visage en institut, lumière chaleureuse",
    photographer: "Katherine Hanlon / Unsplash",
  },
  consultingHero: {
    src: "https://images.unsplash.com/photo-1758518731462-d091b0b4ed0d?q=80&w=1600&auto=format&fit=crop",
    alt: "Signature d'un accord entre professionnels",
    photographer: "Vitaly Gariev / Unsplash",
  },
  consultingDetail: {
    src: "https://images.unsplash.com/photo-1758518730136-1bf4fa26ccbf?q=80&w=1200&auto=format&fit=crop",
    alt: "Réunion de travail autour d'une table de conférence",
    photographer: "Vitaly Gariev / Unsplash",
  },
} as const satisfies Record<string, DemoImage>;
