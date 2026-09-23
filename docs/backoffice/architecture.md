# Back-office FeaseWeb — architecture V1

## État du lot

Le dépôt V4 remplace le store `localStorage` par des Route Handlers protégés et Supabase/PostgreSQL. Le schéma exécutable est la migration `supabase/migrations/20260922140000_backoffice_v4.sql`; `docs/backoffice/schema.sql` est un point d'entrée documentaire vers cette migration. Tant que les variables Supabase ne sont pas fournies, aucune donnée métier n'est lue ou écrite.

La V6 ajoute la migration `supabase/migrations/20260923180000_client_service_activity.sql`. La table `client_updates` porte le journal opérationnel FeaseWeb saisi manuellement par un administrateur : catégorie, titre, description, statut, date et visibilité client. Elle est volontairement distincte de `activity_log`, qui reste un audit interne. Les futures tâches automatisées devront appeler la même couche métier/API que l'admin et ne devront créer une mise à jour qu'après une intervention réellement effectuée.

Les données de démonstration sont explicitement marquées et chargées uniquement par action utilisateur. Elles ne sont pas rendues sur le site public.

## Séparation des espaces

- Site public : routes marketing existantes, inchangées.
- Espace client : `/espace-client` vérifie la session et le rôle `client`, puis ne lit que le client rattaché à `auth.uid()`.
- Back-office interne : `/admin`, protégé par une vérification serveur `admin` dans le layout, un proxy de refresh de session et RLS.

## Modèle de données

Le modèle comporte `profiles`, `prospects`, `clients`, `sites`, `subscriptions`, `payments`, `modification_requests`, `seo_actions`, `seo_metrics`, `domains`, `internal_notes` et `activity_log`. Les clés étrangères, enum, contraintes, index, triggers, fonction de conversion atomique et policies RLS sont dans la migration. Les données personnelles sont rattachées au client, les notes internes et l'activité ne sont jamais exposées au rôle client.

## Workflows

Prospect : formulaire → nouveau → qualification → preview → gagné → conversion client. La conversion crée un client et un site à préparer, puis journalise l'événement.

Site : informations reçues → à préparer → en création → preview → corrections → validé → mise en ligne → actif → maintenance. La génération avec Codex, la preview et la mise en ligne restent manuelles.

Abonnement : le modèle porte 4900 EUR/mois, le provider et les identifiants externes, sans appel Stripe. Le MRR est calculé exclusivement par somme des abonnements `actif`. Le traitement TVA est volontairement `A_CONFIRMER`.

## Authentification et sécurité

Supabase Auth gère les mots de passe et les cookies SSR via `@supabase/ssr`. `proxy.ts` rafraîchit la session, mais chaque layout et Route Handler revalide l'utilisateur et son rôle. La secret key est uniquement serveur. Les secrets doivent rester dans l'environnement, jamais dans Git. Les numéros de carte ne seront jamais stockés.

L'espace client interroge uniquement les lignes qui lui appartiennent via RLS. `client_updates` est lisible par un client seulement lorsque `visible_to_client = true`; les écritures, modifications et suppressions sont réservées à l'admin. Les notes internes et `activity_log` ne sont jamais exposés dans l'espace client. Les demandes client utilisent la même table `modification_requests`, avec un titre persistant ajouté en V6.

## Points avant production

Fournir le projet Supabase et les quatre variables documentées, appliquer la migration, créer le premier admin, exécuter les tests RLS et le test d'intégration réel. Restent aussi SMTP de production, rate limiting distribué, upload sécurisé, monitoring, revue RGPD, Stripe et GSC. Aucun DNS, email transactionnel, Stripe ou GSC métier n'est connecté dans ce lot.
