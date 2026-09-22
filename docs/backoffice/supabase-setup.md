# Configuration Supabase FeaseWeb

## État actuel

Le dépôt ne contient aucun projet ou credential Supabase. Le code V4 est donc préparé mais les appels réels restent bloqués tant que les valeurs ci-dessous ne sont pas fournies. Aucun credential d'un autre projet ne doit être réutilisé.

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
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```

La publishable key peut être embarquée dans le navigateur, mais seulement avec RLS activé. La secret key contourne RLS, reste serveur uniquement et ne doit jamais être préfixée `NEXT_PUBLIC_`.

## Migration

Installer Supabase CLI, lier le projet avec son project ref, puis appliquer la migration :

```bash
supabase link --project-ref <project-ref>
supabase db push
```

La migration versionnée est `supabase/migrations/20260922140000_backoffice_v4.sql`. Ne pas exécuter de SQL manuel non versionné.

## Tests RLS

Après migration, exécuter les tests SQL du dossier `supabase/tests/` avec un projet local Supabase ou l'environnement de test autorisé. Ne pas tester contre la production avec des données réelles.

## Vérification locale

Lancer `npm run dev`, ouvrir `/connexion`, se connecter avec un utilisateur Supabase de test, puis vérifier la redirection selon le rôle. Un admin doit accéder à `/admin`; un client doit accéder à `/espace-client`; les autres cas doivent être refusés côté serveur.

## Ce qui manque

Il faut fournir le project ref, l'URL Supabase, la publishable key et la secret key via un canal sécurisé. Ensuite, créer le premier admin avec la procédure `admin-bootstrap.md`, appliquer la migration et effectuer le test d'intégration réel.
