# Configuration Supabase FeaseWeb

## État actuel

Le dépôt est relié au projet Supabase réel de FeaseWeb et les migrations V4, V5 et V6 ont été appliquées. Les credentials ne sont jamais stockés dans Git. Aucun credential d'un autre projet ne doit être réutilisé.

## Créer ou sélectionner le projet

1. Aller sur [supabase.com/dashboard](https://supabase.com/dashboard).
2. Créer ou sélectionner le projet Supabase dédié à FeaseWeb.
3. Dans `Settings → API Keys`, créer/récupérer une publishable key et une secret key. Supabase déprécie progressivement les anciennes clés `anon` et `service_role` ; V4 utilise les noms actuels.
4. Dans `Authentication → Providers`, activer Email/password et décider de la vérification email avant tout usage réel.
5. Configurer l'URL du site et les redirect URLs locales (`http://localhost:3000`) et de production.

## Variables locales

Copier `.env.example` vers `.env.local`, puis renseigner :

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

La publishable key peut être embarquée dans le navigateur, mais seulement avec RLS activé. La secret key contourne RLS, reste serveur uniquement et ne doit jamais être préfixée `NEXT_PUBLIC_`.

## Migration

Installer Supabase CLI, lier le projet avec son project ref, puis appliquer la migration :

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Les migrations versionnées sont dans `supabase/migrations/`. Ne pas exécuter de SQL manuel non versionné.

## Tests RLS

Après migration, exécuter les tests SQL du dossier `supabase/tests/` avec un projet local Supabase ou l'environnement de test autorisé. Ne pas tester contre la production avec des données réelles.

## Vérification locale

Lancer `npm run dev`, ouvrir `/connexion`, se connecter avec un utilisateur Supabase de test, puis vérifier la redirection selon le rôle. Un admin doit accéder à `/admin`; un client doit accéder à `/espace-client`; les autres cas doivent être refusés côté serveur.

## Avant production

Ajouter dans Supabase Authentication les URLs `https://fease.fr` et `https://fease.fr/**`, en conservant `http://localhost:3000/**` pour le développement. Le parcours reset password n'est pas encore implémenté ; une procédure d'invitation ou de création de compte doit être décidée avant l'onboarding de clients réels.
