# Back-office FeaseWeb — architecture V1

## État du lot

Le dépôt était une maquette Next.js sans backend, base de données ni authentification. Le back-office V1 ajoute une console locale sous `/admin`, un modèle relationnel TypeScript et un schéma PostgreSQL de référence dans `schema.sql`. Les écrans utilisent un store navigateur `localStorage` pour permettre de tester le workflow sans créer arbitrairement de projet cloud.

Les données de démonstration sont explicitement marquées et chargées uniquement par action utilisateur. Elles ne sont pas rendues sur le site public.

## Séparation des espaces

- Site public : routes marketing existantes, inchangées.
- Espace client : `/espace-client` reste une preview explicitement fictive ; il devra lire les mêmes tables après branchement de l'authentification.
- Back-office interne : `/admin`, avec navigation prospects, clients, sites, demandes, SEO, paiements et domaines.

## Modèle de données

Le modèle comporte `users`, `prospects`, `clients`, `sites`, `subscriptions`, `payments`, `modification_requests`, `seo_actions`, `seo_metrics`, `domains`, `internal_notes` et `activity_log`. Les clés étrangères et les enum métier sont regroupés dans `schema.sql`. Les données personnelles sont rattachées au client, les notes internes et l'activité ne doivent jamais être exposées au rôle client.

## Workflows

Prospect : formulaire → nouveau → qualification → preview → gagné → conversion client. La conversion crée un client et un site à préparer, puis journalise l'événement.

Site : informations reçues → à préparer → en création → preview → corrections → validé → mise en ligne → actif → maintenance. La génération avec Codex, la preview et la mise en ligne restent manuelles.

Abonnement : le modèle porte l'offre 49 €/mois, le provider et les identifiants externes, sans appel Stripe. Le MRR est calculé exclusivement par somme des abonnements `actif`.

## Authentification et sécurité

La V1 locale n'est pas une authentification de production : les routes `/admin` ne doivent pas être déployées telles quelles. Avant production, ajouter une authentification serveur, une session cookie `HttpOnly/Secure/SameSite`, un contrôle de rôle `admin` à chaque route serveur et des contrôles de propriété côté espace client. Les secrets doivent rester dans l'environnement, jamais dans Git. Les numéros de carte ne seront jamais stockés.

## Points avant production

Base PostgreSQL migrée et sauvegardée, authentification et RBAC, API serveur avec validation, CSRF selon stratégie, audit des logs, upload sécurisé des pièces jointes, rate limiting, tests d'intégration, monitoring et revue RGPD. Aucun DNS, email, Stripe ou GSC n'est connecté dans ce lot.
