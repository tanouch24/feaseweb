# V7 — Pré-production et mise en ligne

## Variables d’environnement

Le code utilise les variables suivantes :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (serveur uniquement)
- `STRIPE_SECRET_KEY` (serveur uniquement, clé LIVE restreinte)
- `STRIPE_PRICE_ID` (Price LIVE 49 €/mois)
- `STRIPE_WEBHOOK_SECRET` (serveur uniquement)
- `NEXT_PUBLIC_APP_URL`

Localement, `NEXT_PUBLIC_APP_URL` vaut `http://localhost:3000`. En production, il devra valoir `https://fease.fr`. `.env.local` n'est pas suivi par Git.

## Authentification unique

`/connexion` est l'unique écran de connexion. Après authentification Supabase, le rôle `profiles.role` décide de la destination : `admin` vers `/admin`, `client` vers `/espace-client`. Un profil sans rôle valide est refusé et déconnecté. Les layouts et Route Handlers revérifient toujours la session et le rôle côté serveur.

## Supabase avant production

Dans Supabase Authentication, ajouter les URLs du site :

- Site URL : `https://fease.fr`
- Redirect URL : `https://fease.fr/**`
- conserver `http://localhost:3000/**` pour le développement local

Le parcours mot de passe oublié/reset n'est pas implémenté dans cette version : l'onboarding réel doit prévoir une procédure d'invitation ou de création de compte séparée avant ouverture commerciale.

## Stripe après déploiement

Ne pas réutiliser le secret `whsec_` du Stripe CLI local. Après mise en ligne :

1. créer dans Stripe Dashboard LIVE un endpoint `https://fease.fr/api/stripe/webhook` ;
2. sélectionner `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid` et `invoice.payment_failed` ;
3. récupérer le signing secret propre à cet endpoint Dashboard ;
4. renseigner ce secret dans Netlify comme `STRIPE_WEBHOOK_SECRET` ;
5. effectuer uniquement des tests de signature non financiers avant tout premier paiement réel.

Le Checkout et le Customer Portal utilisent `NEXT_PUBLIC_APP_URL` pour leurs URLs de retour. Aucun montant, Price ID ou Customer ID n'est accepté depuis le navigateur.

## Séquence Netlify future

1. pousser `main` sur le repository GitHub vide ;
2. importer le repository dans Netlify ;
3. configurer les variables d'environnement de production ;
4. lancer le premier build ;
5. vérifier l'URL Netlify temporaire ;
6. ajouter `fease.fr` comme domaine principal ;
7. récupérer les DNS demandés par Netlify ;
8. modifier les DNS chez IONOS ;
9. attendre la validation et le SSL ;
10. configurer `fease.com` en redirection vers `fease.fr` ;
11. ajouter les URLs Supabase Auth de production ;
12. créer le webhook Stripe Dashboard LIVE ;
13. effectuer les smoke tests non financiers ;
14. réaliser un premier paiement réel uniquement après un GO séparé.

Netlify supporte les routes Next.js et Route Handlers via son runtime Next.js ; aucun `netlify.toml` n'est nécessaire à ce stade. Le build de référence est `npm run build`.

## Points restant avant production

- compléter et valider juridiquement les informations légales manquantes (hébergeur, directeur de publication, conservation, sous-traitants, CGV) ;
- décider et implémenter le parcours de reset/invitation avant onboarding client ;
- configurer Supabase, Netlify et le webhook Stripe après le push ;
- remplacer la rate limit mémoire du formulaire prospect par une protection distribuée adaptée au runtime serverless ;
- réaliser les smoke tests sur l'URL Netlify avant le premier paiement.
