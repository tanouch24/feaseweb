# Stripe Billing — V5 LIVE-ready

## Produit et prix

Créer un produit FeaseWeb et un prix récurrent mensuel de `49,00 EUR`. Le montant affiché dans l'application viendra de la configuration serveur et non d'une valeur éditable par le navigateur.

## Parcours

Le serveur crée ou retrouve le `customer`, lance un Checkout en mode abonnement, puis enregistre uniquement les identifiants Stripe (`customer.id`, `subscription.id`, `invoice.id`). Les données de carte restent chez Stripe. Le Price serveur est imposé par `STRIPE_PRICE_ID` et n'est jamais accepté depuis le navigateur.

## Webhooks

L'endpoint serveur est signé par `STRIPE_WEBHOOK_SECRET`, traite le body brut et est idempotent sur `event.id`. Il traite `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid` et `invoice.payment_failed`. Les identifiants et états sont synchronisés dans Supabase ; un événement dont le traitement échoue libère sa réservation d'idempotence afin que Stripe puisse le rejouer.

## États et opérations

Mapper les états Stripe vers `incomplet`, `actif`, `retard`, `impaye`, `annule`. Prévoir facture consultable via une URL Stripe, relance, résiliation et portail client. Les transitions doivent être côté serveur, rejouables et protégées contre le double traitement.

## Pré-requis

Les clés restent uniquement côté serveur, la signature est obligatoire, les logs n'incluent ni secret ni données de carte, et le portail est contrôlé par la configuration Stripe LIVE. Les tests automatisés mockent Stripe. La QA de ce lot utilise uniquement des lectures LIVE (Price, compte et configuration Portal) et des requêtes locales non authentifiées ; aucun Checkout, Customer, abonnement, facture ou PaymentMethod n'est créé.

## Configuration LIVE vérifiée

- Price actif : `49,00 EUR` par mois.
- Product associé actif.
- Customer Portal actif : historique des factures, informations client et moyens de paiement activés ; modification et annulation d'abonnement désactivées.
- Aucun lien de portail sans code n'est activé.

## Avant le premier paiement

Le premier Checkout réel doit être déclenché volontairement, avec validation métier et juridique préalable. Il ne fait pas partie de la QA automatisée. Vérifier avant cette étape les CGV, le régime de TVA, les emails, la stratégie de relance et le comportement de suspension en cas d'impayé.
