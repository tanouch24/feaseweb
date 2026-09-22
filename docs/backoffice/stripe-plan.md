# Plan Stripe Billing — non implémenté

## Produit et prix

Créer un produit FeaseWeb et un prix récurrent mensuel de `49,00 EUR`. Le montant affiché dans l'application viendra de la configuration serveur et non d'une valeur éditable par le navigateur.

## Parcours

Après validation du site, le serveur crée ou retrouve le `customer`, lance un Checkout en mode abonnement, puis enregistre uniquement les identifiants Stripe (`customer.id`, `subscription.id`, `invoice.id`). Les données de carte restent chez Stripe.

## Webhooks

Créer un endpoint serveur signé par `STRIPE_WEBHOOK_SECRET`, idempotent sur `event.id`. Traiter au minimum `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed` et les remboursements. Mettre à jour abonnement, échéance et dernier paiement dans une transaction.

## États et opérations

Mapper les états Stripe vers `incomplet`, `actif`, `retard`, `impaye`, `annule`. Prévoir facture consultable via une URL Stripe, relance, résiliation et portail client. Les transitions doivent être côté serveur, rejouables et protégées contre le double traitement.

## Pré-requis

Variables séparées test/production, clés uniquement côté serveur, tests avec Stripe CLI et fixtures, validation de signature, journal sans données sensibles, gestion RGPD et stratégie de suspension du site. Ce plan ne crée aucun abonnement et n'utilise aucune clé réelle.
