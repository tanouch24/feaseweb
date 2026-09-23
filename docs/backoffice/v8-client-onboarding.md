# V8 — Onboarding client et récupération de compte

## Parcours

Il n'existe aucune inscription publique. Un prospect devient client dans le back-office, puis un administrateur invite l'adresse email du client depuis sa fiche.

Le rôle `profiles.role` reste l'autorité (`admin` ou `client`) et `clients.user_id` associe le compte Auth au dossier métier.

## Routes

- `/connexion` : connexion unique, récupération et CTA commercial ;
- `/activation-compte` : définition du mot de passe après invitation ;
- `/mot-de-passe-oublie` : demande de récupération non énumérable ;
- `/nouveau-mot-de-passe` : définition du nouveau mot de passe ;
- `/auth/callback` : échange PKCE SSR Supabase avec destinations internes allowlistées.

Les opérations d'invitation utilisent `auth.admin.inviteUserByEmail` depuis une route server-only protégée par `requireApiAdmin`. Aucun token n'est envoyé à l'interface.

## Migration

`supabase/migrations/20260923190000_client_onboarding.sql` ajoute sur `clients` :

- `access_status` : `non_invite`, `invitation_envoyee`, `actif` ;
- `invited_at` ;
- `activated_at`.

La migration doit être appliquée au projet Supabase réel avant d'utiliser le bouton d'invitation en production. Elle ne modifie pas Stripe, les domaines ou les DNS.

## Configuration Supabase à vérifier

- Site URL : `https://fease.fr` ;
- Redirect URL : `https://fease.fr/**` ;
- Redirect URL locale : `http://localhost:3000/**` ;
- Email/password activé ;
- SMTP de production configuré ;
- templates d'invitation et de récupération testés sans exposer de token dans l'interface.
