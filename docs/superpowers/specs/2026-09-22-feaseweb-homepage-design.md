# FeaseWeb — Maquette front-end (design)

Date : 2026-09-22
Statut : validé par l'utilisateur, prêt pour le plan d'implémentation.

## 1. Contexte et objectif

FeaseWeb est un service géré de site internet pour artisans, TPE, commerçants,
indépendants et professions libérales. Le produit n'est pas un constructeur de
site : FeaseWeb crée ou refait le site, l'héberge, le maintient, le sécurise
et travaille son référencement — en continu, pas seulement à la livraison.

Message central (à faire ressentir, pas seulement écrire) :

> « Votre site internet, sans avoir à vous en occuper. »
> Le 0 € de création est l'accroche. Le service géré à 49 €/mois, SEO compris,
> est le produit.

Objectif de cette mission : livrer une **maquette front-end navigable**,
extrêmement aboutie visuellement, sans backend réel (pas de paiement, pas
d'auth, pas de génération de site automatisée — cf. section "Hors périmètre").

**Priorité d'arbitrage explicite (du plus important au moins important) :**
1. Qualité de la homepage (`/`)
2. Rendu responsive (mobile-first, 375–1440px)
3. Qualité visuelle générale / direction artistique
4. Pages exemples + dashboard (`/exemples`, `/espace-client`)
5. Pages secondaires (légal, connexion, routes de démo des CTA)

Si le temps ou la qualité doivent être arbitrés, c'est dans cet ordre — la
homepage ne doit jamais être sacrifiée pour finir une page secondaire.

## 2. Offre commerciale — à respecter strictement

Une seule offre, affichée partout de façon cohérente :

- **0 € de frais de création ou de refonte**
- puis **49 €/mois — tout compris (SEO inclus)**

Interdits absolus dans tout le contenu et le code (y compris commentaires/
placeholders) : `39 €`, `78 €`, `98 €`, toute mention de "SEO +49€" ou d'option
SEO payante séparée, tout second palier tarifaire. Une vérification par grep
sur `39`, `78`, `98`, `SEO +49`, `+49` doit être faite avant de considérer la
maquette terminée (voir section QA).

## 3. Stack technique

- Next.js (App Router), TypeScript, React.
- Tailwind CSS pour le styling utilitaire.
- `next/font/google` pour Fraunces + Public Sans (auto-hébergées, pas de FOUT).
- Pas de librairie d'animation lourde : reveal au scroll via un petit hook
  `useInView` basé sur `IntersectionObserver`, transitions CSS pures.
- Pas de backend réel : pas de base de données, pas d'auth, pas de Stripe. Les
  formulaires (contact/devis, "créer mon site") sont des UI de démonstration
  qui peuvent afficher un état de succès local sans appel réseau.
- Architecture "statique-friendly" : aucune route ne dépend de données
  dynamiques server-side ; tout le contenu de démo est en dur dans le code
  (fichiers de données TS clairement nommés `*.demo.ts` ou commentés comme
  maquette).

## 4. Design system — tokens (ajustables sans refonte)

Toutes les valeurs ci-dessous sont des **tokens** (variables CSS / config
Tailwind), pas des valeurs codées en dur dans les composants, pour pouvoir
changer couleur/typo/logo/spacing plus tard sans toucher au reste du site.

### Couleurs (V1, ajustable)

| Token | Valeur | Usage |
|---|---|---|
| `--color-bg` | `#FBFAF7` | fond principal, blanc cassé |
| `--color-bg-alt` | `#F3F1EC` | sections alternées, cartes |
| `--color-ink` | `#14171A` | texte principal, quasi-noir |
| `--color-ink-soft` | `#4A5057` | texte secondaire |
| `--color-brand` | `#1E4A43` | couleur de marque, CTA, logo |
| `--color-brand-dark` | `#12332E` | hover CTA, fonds sombres de marque |
| `--color-accent` | `#C98A3E` | accent chaud, usage rare (prix, coches) |
| `--color-line` | `#E4E1D8` | bordures, séparateurs |

### Typographie (V1, ajustable)

- Titres / prix / gros chiffres : **Fraunces** (serif éditorial), poids
  Light/Medium/SemiBold selon la taille.
- UI / corps / navigation / boutons : **Public Sans**.
- Échelle type (desktop) : H1 ~56–64px, H2 ~40px, H3 ~28px, body ~17–18px,
  petit texte ~14px. Mobile : H1 ~34–40px, H2 ~26–28px.

### Espacement / rayon / ombre

- Échelle d'espacement en base 4px (tokens Tailwind par défaut, pas de valeurs
  magiques dans les composants).
- Rayons : `--radius-sm` 8px, `--radius-md` 14px, `--radius-lg` 24px — coins
  arrondis modérés, pas de style "glassmorphism".
- Ombres très discrètes (une seule échelle, pas d'ombres colorées).

### Logo

- Wordmark "FeaseWeb" en Fraunces medium : "Fease" en `--color-ink`, "Web" en
  `--color-brand`.
- Monogramme (favicon / app icon) : "F" simple sur pastille `--color-brand`,
  fond `--color-bg`.
- Le composant `Logo` doit accepter une prop de taille/variant, pas de logo
  codé en dur en plusieurs endroits.

## 5. Pages / routes

Toutes les routes sont des démonstrations front-end, aucune logique métier
réelle.

- `/` — homepage complète (voir section 6). **Priorité absolue.**
- `/creer-mon-site` — page de démo pour le parcours "je n'ai pas de site"
  (formulaire simple, pas de soumission réelle).
- `/refaire-mon-site` — page de démo pour le parcours "j'ai déjà un site"
  (champ URL + explication du processus de refonte).
- `/exemples` — galerie des sites de démonstration.
- `/exemples/[slug]` — détail d'un site de démo (desktop + mobile), avec la
  mention visible "Exemple de site FeaseWeb".
- `/espace-client` — maquette du dashboard (voir section 7).
- `/connexion` — écran de connexion factice (pas d'auth réelle).
- `/mentions-legales`, `/confidentialite`, `/cgv`, `/cookies` — pages légales
  avec `TODO` explicites dans le contenu (pas d'informations juridiques
  inventées : SIREN, adresse, capital social, etc. restent des `TODO`).

## 6. Homepage — sections (contenu déjà validé par l'utilisateur)

Dans l'ordre, en respectant fidèlement les textes/idées du brief original :

1. **Header** sticky discret : logo, nav (Comment ça marche / Tout compris /
   Exemples / Tarif / FAQ), lien secondaire "Connexion", CTA "Créer mon site".
2. **Hero** : eyebrow, H1 sur deux lignes ("Votre site internet." / "Sans
   avoir à vous en occuper."), sous-titre, bloc prix visible (0 € puis
   49 €/mois tout compris), CTA primaire "Créer mon site" + secondaire
   "Refaire mon site", ligne de réassurance. Visuel hero = vraies maquettes
   HTML/CSS (desktop + mobile + indicateurs "Site en ligne" / "SEO suivi" /
   "Maintenance active"), pas d'illustration abstraite ni d'image externe.
3. **Section de rupture éditoriale** : "Votre métier n'est pas de gérer un
   site internet." / "Et ça tombe bien : c'est le nôtre." — message
   émotionnel court, pas de liste interminable.
4. **Deux parcours** : "Je n'ai pas de site" → `/creer-mon-site` ; "J'ai déjà
   un site" → `/refaire-mon-site`. Deux grandes cartes graphiques.
5. **Comment ça marche** : 4 étapes max (Parlez-nous de votre entreprise /
   FeaseWeb prépare votre site / Vous validez / On s'occupe du reste). L'étape
   4 est fondamentale — c'est ce qui différencie FeaseWeb du DIY.
6. **Offre — "49 €/mois. Et on s'occupe du reste."** : 0 € de frais de
   création, liste des inclus (site pro, jusqu'à 5 pages, mobile, hébergement,
   sécurité/SSL, maintenance, sauvegardes, formulaire devis, petites
   modifications, SEO, suivi visibilité Google, espace client). Une seule
   offre, pas de tiers de prix.
7. **"Vous ne construisez rien"** : comparaison éditoriale constructeur DIY vs
   FeaseWeb, sans citer de marque concurrente, sans chiffre non sourcé.
8. **Exemples de sites** : 4 démonstrations (Dupont Plomberie, Atelier
   Toiture, Maison Éclat, Cabinet Horizon), mention "Exemple de site FeaseWeb"
   visible sur chaque carte, lien vers `/exemples/[slug]`.
9. **Espace client** : aperçu du dashboard (voir section 7), titre "Votre
   site, toujours sous contrôle."
10. **Modifications** : workflow "Demande envoyée → En cours → Terminée",
    exemples concrets (horaires, photo, prestation, texte).
11. **SEO inclus** : "Un beau site ne suffit pas. Il faut aussi qu'on puisse
    le trouver." — aucune promesse de résultat/position/trafic.
12. **Tout est géré** : 4 blocs éditoriaux max (Création / Technique /
    Évolution / Visibilité), pas 20 petites cartes.
13. **FAQ** : accordéon, questions du brief. Pour résiliation/propriété/rachat
    du site : texte clairement marqué dans le code comme `[À VALIDER AVANT
    PRODUCTION]` reprenant le wording provisoire du brief (mise à disposition
    avec possibilité de rachat/transfert, modalités non figées).
14. **CTA final** : "Vous avez une entreprise. On s'occupe de son site." + CTA
    "Créer mon site" + lien secondaire "J'ai déjà un site →".
15. **Footer** : logo, nav, liens légaux (avec TODO si info manquante).

## 7. Dashboard `/espace-client` — périmètre volontairement simple

Doit faire comprendre la valeur des 49 €/mois, pas simuler un vrai SaaS :

- Navigation : Accueil, Mon site, Mes demandes, Mon référencement, Factures &
  abonnement, Support.
- Contenu principal (données de démo, clairement identifiées comme aperçu) :
  - "Mon site" : statut "En ligne ✓".
  - "Visibilité Google" : un petit graphique simple (SVG/CSS, pas de lib de
    charting lourde).
  - "Mes demandes" : "1 modification en cours".
  - "Abonnement" : "49 €/mois — Actif".
- Mention explicite quelque part sur la page que c'est une maquette de
  démonstration (aperçu produit), pas le vrai espace client.

## 8. Preuves et contenu — règles strictes

- Aucun faux client, faux témoignage, faux logo, fausse statistique, fausse
  note, faux résultat SEO.
- Les 4 sites de démo portent explicitement la mention "Exemple de site
  FeaseWeb" — jamais présentés comme de vrais clients.
- Tous les textes visibles en français, pas de lorem ipsum, pas de jargon
  marketing creux ("révolutionnez votre présence digitale...").

## 9. Composants principaux

`Header`, `Footer`, `Logo`, `Hero`, `PriceBadge`, `CTAButton`, `SiteMockup`
(desktop), `PhoneMockup`, `DashboardPreview`, `ProcessSteps`, `TwoPathsCards`,
`DemoSiteCard`, `ComparisonBlock`, `ServiceEditorialGrid`, `ModificationFlow`,
`SEOSection`, `FAQAccordion`, `SectionHeading`, `RevealOnScroll` (wrapper
hook-based, respecte `prefers-reduced-motion`).

Chaque composant doit être compréhensible sans lire ses internals (props
claires, pas de logique métier cachée) — cf. principe d'isolation des unités.

## 10. Animations et performance

- Reveal au scroll léger (translateY + opacity, ~400ms, easing standard),
  désactivé si `prefers-reduced-motion: reduce`.
- Hover premium sur CTA et cartes (transition couleur/ombre légère, pas de
  scale exagéré).
- Aucune vidéo, aucune image externe lourde ; tous les mockups (site,
  téléphone, dashboard) sont du HTML/CSS/SVG interne.
- Pas de dépendance additionnelle pour des effets réalisables en CSS pur.

## 11. Accessibilité

HTML sémantique, contrastes AA minimum, focus visible, navigation clavier
complète (notamment header mobile et accordéon FAQ), labels de formulaire,
`alt` pertinents (mockups en SVG/HTML donc peu d'`<img>`, mais toute image
réelle doit avoir un `alt`).

## 12. QA avant de considérer la maquette comme finalisée

Dans cet ordre, avant tout commit :

1. Build : `next build`, `tsc --noEmit`, `eslint` sans erreur bloquante.
2. Vérification responsive manuelle à 375 / 390 / 430 / 768 / 1024 / 1440px,
   aucun overflow horizontal.
3. Grep sur tout le repo : `39`, `78`, `98`, `SEO +49`, `+49` — confirmer
   qu'aucun ancien pricing n'apparaît (hors ce fichier de spec et le plan, qui
   documentent l'interdiction).
4. Grep sur des mots-clés de preuve interdite (`témoignage`, `avis`, `★`) pour
   s'assurer qu'aucun faux témoignage/note n'a été ajouté par erreur.
5. **Passe de direction artistique** : relecture section par section comme un
   directeur artistique (hiérarchie, espacements, ratios, densité, mockups,
   rendu mobile, transitions) — corriger avant de montrer le résultat.
6. Présentation du résultat à l'utilisateur pour validation.
7. Commit local uniquement après validation utilisateur — **aucun push
   GitHub** tant que l'autorisation explicite n'est pas donnée.

## 13. Hors périmètre (explicitement, pour cette mission)

Paiement réel/Stripe, base de données clients, authentification de
production, automatisation SEO, génération automatique de sites, API
publicitaires (Meta/Google Ads), CRM complet. Les boutons/CTA qui évoqueraient
ces flux mènent vers des pages de démonstration statiques, pas vers de vraies
intégrations.
