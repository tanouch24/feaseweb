# SKILL SEO MASTER — CODEX + OPENSEO + GSC

# Utilisation

Avant toute tâche SEO sur FeaseWeb :

1. lire ce fichier ;
2. respecter les phases et garde-fous ;
3. ne jamais interpréter prématurément les données GSC ;
4. ne jamais modifier production/DNS/Supabase/Stripe sans consigne explicite ;
5. toujours vérifier l’état Git avant modification ;
6. utiliser `SEO_BASE_URL=https://feaseweb.fr npm run seo:check` pour les contrôles production.

# Source de vérité FeaseWeb

DOMAINE OFFICIEL :
https://feaseweb.fr

OFFRE ACTUELLE :
49 €/mois

INCLUS :

- création/refonte sans frais de création
- hébergement
- maintenance
- SEO
- suivi
- petites modifications encadrées

INTERDIT DE RÉINTRODUIRE :

- 39 €
- 78 €
- SEO en option
- fease.fr

# Outils

Stack SEO officielle :

- Codex
- OpenSEO
- Google Search Console
- Lighthouse
- production réelle
- `npm run seo:check`

# Règle de session

Toute future session SEO doit commencer par :

- lire le skill ;
- `pwd` ;
- `git status --short` ;
- vérifier le domaine ciblé ;
- vérifier si le travail dépend de GSC ou non.

Si les données GSC sont insuffisantes :
ne pas inventer une optimisation.


## 0. Rôle du skill

Ce document est la procédure maître pour auditer, construire, corriger, publier et piloter le SEO d’un site ou d’une application web avec une approche opérationnelle basée sur :

- Codex pour l’audit du repo, les corrections, les tests et l’automatisation ;
- OpenSEO pour les concurrents, mots-clés, volumes, difficulté, gaps et backlinks ;
- Google Search Console pour la vérité terrain : crawl, indexation, requêtes, clics, impressions, CTR et positions ;
- Lighthouse / PageSpeed pour la performance et les Core Web Vitals ;
- la production réelle pour vérifier que ce qui fonctionne en local est réellement servi sur Internet.

La méthode suit toujours cette boucle :

> MESURER → DIAGNOSTIQUER → PRIORISER → MODIFIER PEU → QA → PUBLIER → ATTENDRE LE RECRAWL → MESURER À NOUVEAU

Règle centrale : ne jamais optimiser à l’aveugle une page qui n’est pas correctement crawlée/indexée, et ne jamais créer une nouvelle URL si une page existante peut porter l’intention.

---

# 1. Principes non négociables

## 1.1 Une intention principale par URL

Chaque page doit viser une intention dominante.

Exemples :

- page commerciale → conversion ;
- article → information / diagnostic / guide ;
- page prix → tarification ;
- page maintenance → maintenance ;
- page SEO → référencement.

Deux URL ne doivent pas viser exactement la même intention sans raison.

## 1.2 Source de vérité business avant SEO

Avant tout audit, définir :

- domaine officiel ;
- marque officielle ;
- offre actuelle ;
- prix actuel ;
- services inclus ;
- services optionnels ;
- promesses autorisées ;
- promesses interdites ;
- cibles principales ;
- marché géographique ;
- langue principale.

Ensuite rechercher dans le code actif toutes les anciennes informations : ancien domaine, anciens prix, anciennes offres, anciennes promesses.

## 1.3 Ne pas créer des pages pour remplir le sitemap

Une nouvelle page n’est justifiée que si :

- elle répond à une intention distincte ;
- elle a une valeur business ou informationnelle réelle ;
- elle n’entre pas en cannibalisation ;
- elle peut apporter plus qu’une simple reformulation d’une autre page ;
- elle est suffisamment utile pour mériter d’être indexée.

## 1.4 Le volume ne décide pas seul

On priorise selon :

- intention ;
- valeur business ;
- difficulté réelle de la SERP ;
- volume ;
- concurrence ;
- capacité du site à produire une meilleure réponse ;
- capacité à soutenir une money page.

## 1.5 Pas de surpromesse SEO

Ne jamais promettre :

- position 1 ;
- trafic garanti ;
- nombre de leads garanti ;
- nombre de ventes garanti ;
- chiffre d’affaires garanti ;
- indexation garantie ;
- maintien garanti des positions pendant une refonte.

Formulation correcte : amélioration progressive, optimisation, suivi, limitation des pertes évitables, analyse des signaux disponibles.

---

# 2. Stack d’outils

## 2.1 Codex

Codex est utilisé pour :

- audit du repository ;
- inventaire des routes ;
- audit des metadata ;
- sitemap ;
- robots ;
- canonical ;
- JSON-LD ;
- maillage ;
- liens cassés ;
- redirections ;
- performance locale ;
- tests ;
- création de scripts SEO ;
- vérification production ;
- comparaison local/prod.

Codex doit fonctionner par lots courts : un objectif par prompt.

## 2.2 OpenSEO

OpenSEO sert à :

- créer le projet SEO ;
- choisir marché et langue ;
- trouver les concurrents organiques ;
- récupérer mots-clés, volumes, difficulté et intention ;
- faire le keyword gap ;
- identifier des contenus prioritaires ;
- analyser le profil backlinks ;
- trouver des prospects backlinks ;
- connecter GSC lorsque possible.

OpenSEO n’est pas la source de vérité pour les performances réelles du site. Cette source reste GSC.

## 2.3 Google Search Console

GSC sert à mesurer :

- pages connues de Google ;
- pages crawlées ;
- indexation ;
- canonical déclarée ;
- canonical choisie par Google ;
- dernier crawl ;
- clics ;
- impressions ;
- CTR ;
- position moyenne ;
- requêtes ;
- pages ;
- appareils ;
- pays ;
- sitemap ;
- problèmes d’indexation.

GSC a souvent un délai de plusieurs jours. Ne jamais interpréter le jour courant comme complet.

## 2.4 Lighthouse / PageSpeed

Utiliser pour :

- LCP ;
- CLS ;
- TBT / diagnostic interaction ;
- SEO ;
- accessibilité ;
- performance mobile ;
- diagnostic d’une page lente.

Le score Lighthouse n’est pas un objectif en soi. Les données terrain restent plus importantes lorsque disponibles.

## 2.5 Production réelle

Toujours vérifier :

- HTML production ;
- canonical production ;
- robots production ;
- sitemap production ;
- cache ;
- headers ;
- redirections ;
- nouvelle route ;
- indexabilité ;
- contenu réellement servi.

Une correction locale non servie en production ne compte pas.

---

# 3. Phase 0 — Baseline et règles de travail

Avant toute modification :

1. identifier le domaine canonique ;
2. noter le nombre d’URLs sitemap ;
3. noter les pages business ;
4. noter le nombre de backlinks / domaines référents ;
5. noter l’état GSC ;
6. noter les métriques disponibles ;
7. noter les pages indexées ;
8. noter les dernières dates de crawl ;
9. noter les problèmes techniques existants ;
10. figer les anciennes offres à bannir.

### Discipline Git

Toujours :

- `git status --short`
- `git branch -vv`
- `git log -5 --oneline --decorate`
- `git diff --stat`
- `git diff --check`

Ne jamais utiliser `git add .` ou `git add -A` dans un lot SEO sensible.

Stage explicite uniquement.

---

# 4. Phase 1 — Audit technique sans modification

Objectif : comprendre avant de toucher.

## 4.1 Inventaire des URLs

Comparer :

- routes Next.js ;
- sitemap ;
- articles publiés ;
- pages publiques ;
- pages privées ;
- pages noindex.

Chercher :

- URL manquante du sitemap ;
- URL privée dans sitemap ;
- URL 404 dans sitemap ;
- doublon ;
- page orpheline ;
- mauvaise canonical ;
- mauvais trailing slash ;
- pages draft servies par erreur.

## 4.2 Crawl complet

Pour chaque URL publique vérifier :

- HTTP ;
- title ;
- meta description ;
- canonical ;
- robots ;
- H1 ;
- H2 ;
- JSON-LD ;
- OpenGraph ;
- images ;
- alt ;
- liens internes ;
- liens externes ;
- langue HTML ;
- viewport.

## 4.3 Contrôles techniques prioritaires

- une seule version du domaine ;
- HTTPS ;
- redirections propres ;
- pas de chaîne inutile ;
- 404 réelles ;
- pas de soft 404 ;
- robots cohérent ;
- noindex volontaire uniquement ;
- sitemap uniquement avec URL canoniques, 200, indexables ;
- canonical cohérente ;
- pas d’ancien domaine ;
- pas d’ancienne offre.

---

# 5. Phase 2 — Audit business et architecture

## 5.1 Lister les money pages

Exemples :

- accueil ;
- création ;
- refonte ;
- maintenance ;
- SEO ;
- tarifs ;
- pages verticales / métiers ;
- pages produit ;
- pages de conversion.

## 5.2 Vérifier les intentions

Pour chaque page :

- intention principale ;
- mot-clé principal ;
- mots-clés secondaires ;
- CTA ;
- cible ;
- page concurrente éventuelle ;
- risque de cannibalisation.

## 5.3 Ne pas créer une page par micro-service

Si le service peut être expliqué sur une page existante, l’ajouter là.

Nouvelle page uniquement si :

- intention claire ;
- volume ou valeur business ;
- contenu distinct ;
- réel besoin utilisateur.

---

# 6. Phase 3 — OpenSEO : concurrence, mots-clés, gaps

## 6.1 Créer le projet

Paramètres :

- domaine ;
- pays ;
- langue.

## 6.2 Identifier les concurrents

Séparer :

- concurrents business ;
- concurrents SEO ;
- médias / comparateurs ;
- marketplaces ;
- acteurs institutionnels.

## 6.3 Rechercher les mots-clés

Pour chaque mot-clé :

- volume ;
- difficulté ;
- CPC si disponible ;
- intention ;
- SERP ;
- page cible ;
- valeur business.

## 6.4 Priorisation simple

Priorité élevée si :

- intention forte ;
- faible difficulté ;
- bon volume ;
- lien direct avec l’offre ;
- SERP attaquable ;
- page money claire à soutenir.

## 6.5 Keyword gap

Chercher :

- requêtes où les concurrents rankent ;
- requêtes où le site n’a aucune page ;
- requêtes où une page existe mais est faible ;
- requêtes qui justifient un article P1 ;
- requêtes qui justifient un renforcement d’une page existante.

---

# 7. Phase 4 — Optimiser les money pages avant le blog

Ordre recommandé :

1. accueil ;
2. page principale produit/service ;
3. tarifs ;
4. pages métier ;
5. maintenance / support ;
6. SEO / acquisition ;
7. pages secondaires.

Contrôler :

- title ;
- meta ;
- H1 ;
- introduction ;
- bénéfice ;
- périmètre ;
- limites ;
- CTA ;
- FAQ ;
- schema ;
- maillage ;
- cohérence prix/offre.

Toujours distinguer :

- page commerciale ;
- article informationnel.

---

# 8. Phase 5 — GSC et sitemap

## 8.1 Property

Préférer une propriété de domaine quand possible.

## 8.2 Sitemap

Vérifier :

- URL accessible ;
- 200 ;
- toutes les pages utiles ;
- aucun draft ;
- aucune route privée ;
- génération automatique ;
- pas de cache stale bloquant.

## 8.3 Indexation prioritaire

Inspecter manuellement seulement les pages clés :

- home ;
- money pages ;
- articles P1 ;
- linkable asset ;
- nouvelle landing importante.

Ne pas demander l’indexation de centaines d’URLs manuellement.

## 8.4 Canonical

Si GSC montre une ancienne canonical déclarée mais que la production est déjà correcte : ne pas modifier le code inutilement. Attendre le prochain crawl.

---

# 9. Phase 6 — Contenu P1

## 9.1 Choix

Sélectionner un contenu qui combine :

- volume ;
- difficulté ;
- intention ;
- valeur business ;
- soutien d’une money page ;
- faible cannibalisation.

## 9.2 Architecture

Frontmatter minimum :

- title ;
- description ;
- excerpt ;
- publishedAt ;
- author ;
- category ;
- primaryKeyword ;
- secondaryKeywords ;
- targetPage ;
- targetLabel ;
- status.

## 9.3 Structure de contenu

- H1 clair ;
- introduction courte ;
- bloc “En bref” ;
- H2/H3 issus de vraies questions ;
- checklist / étapes si utile ;
- limites ;
- CTA contextuel ;
- FAQ si utile ;
- sources officielles.

Pas de longueur artificielle.

## 9.4 GEO / AEO

Le contenu doit être extractible :

- réponses directes ;
- définitions nettes ;
- paragraphes autonomes ;
- listes ;
- tableaux seulement si utiles ;
- faits sourcés ;
- limites explicites ;
- entités cohérentes.

---

# 10. Phase 7 — Maillage interne

## 10.1 Règles

- article prix → page tarifs ;
- article refonte → page refonte ;
- checklist artisan → page artisan ;
- contenu informatif → money page correspondante.

## 10.2 Orphelines

Toute page indexable importante doit recevoir au moins un lien interne pertinent.

## 10.3 Ancres

- naturelles ;
- descriptives ;
- variées ;
- pas de bourrage exact-match ;
- pas de footer SEO artificiel.

---

# 11. Phase 8 — Linkable asset

Créer une ressource utile que d’autres peuvent citer.

Exemples :

- checklist ;
- calculateur ;
- simulateur ;
- baromètre ;
- étude ;
- modèle ;
- guide pratique ;
- benchmark ;
- outil gratuit.

Critères :

- utilité réelle ;
- partageabilité ;
- différenciation ;
- cohérence avec la cible ;
- potentiel de citation ;
- potentiel de lead.

Ne jamais présenter une checklist comme une étude.

---

# 12. Phase 9 — Backlinks

## 12.1 Baseline

Mesurer :

- backlinks ;
- domaines référents ;
- ancres ;
- concurrents ;
- gap.

## 12.2 Cibles prioritaires

- médias de niche ;
- associations ;
- SaaS complémentaires ;
- partenaires ;
- fournisseurs ;
- réseaux professionnels ;
- ressources sectorielles ;
- presse locale ;
- répertoires sérieux ;
- pages outils / ressources.

## 12.3 Éviter

- PBN ;
- vente massive de liens ;
- annuaires faibles ;
- échange systématique ;
- commentaires spam ;
- domaines sans rapport ;
- concurrents directs pour demande de lien.

## 12.4 Priorisation

Pour chaque cible :

- pertinence ;
- activité réelle ;
- voie de contact ;
- page ressource ;
- partenaire possible ;
- difficulté ;
- priorité ;
- statut.

## 12.5 Tracking

CSV recommandé :

- domain
- name
- category
- url
- contact_url
- contact_type
- reason
- target_asset
- angle
- difficulty
- priority
- status
- link_url
- follow_status
- notes

Statuts :

- QUALIFIED
- LIVE
- PENDING
- MANUAL_REQUIRED
- WATCH
- DROP

---

# 13. Phase 10 — Hardening SEO

Quand les fondations sont en place, faire un passage final :

- crawl complet ;
- titles uniques ;
- metas uniques ;
- canonicals ;
- noindex ;
- schema ;
- orphan pages ;
- broken links ;
- 404 ;
- redirects ;
- images ;
- alt ;
- accessibility SEO ;
- Lighthouse ;
- robots ;
- sitemap ;
- duplication ;
- thin content ;
- trust pages ;
- ancienne offre / ancien domaine.

---

# 14. Automatisation dans le repo

Créer un script de santé SEO, par exemple :

`scripts/seo-health-check.mjs`

Commande :

`npm run seo:check`

Le script doit vérifier au minimum :

- URL ;
- status ;
- title ;
- meta description ;
- canonical ;
- robots/noindex ;
- H1 count ;
- broken links ;
- ancien domaine ;
- ancien prix ;
- sitemap count ;
- duplicate titles ;
- duplicate meta ;
- JSON-LD invalide ;
- orphan pages.

Objectif : rendre les régressions SEO visibles avant chaque release.

---

# 15. Tests de régression SEO

Ajouter des tests automatiques qui protègent :

- domaine officiel ;
- prix officiel ;
- absence ancienne offre ;
- canonical ;
- sitemap ;
- drafts exclus ;
- money pages indexables ;
- articles published présents ;
- pages privées absentes du sitemap ;
- linkable assets indexables seulement quand publiés ;
- liens internes stratégiques.

---

# 16. Cadence GSC

## J+3

Observer :

- découverte des nouvelles URLs ;
- dernier crawl ;
- indexation ;
- sitemap ;
- canonical ;
- erreurs.

## J+7

Observer :

- premières impressions ;
- premières requêtes ;
- pages visibles ;
- premiers CTR ;
- pays ;
- appareils.

## J+14

Observer :

- positions 4–10 ;
- positions 11–20 ;
- impressions sans clic ;
- premières requêtes business ;
- cannibalisation éventuelle.

## J+28

Comparer :

- clics ;
- impressions ;
- CTR ;
- positions ;
- pages ;
- requêtes ;
- indexation ;
- domaines référents.

---

# 17. Règles de décision GSC

## WAIT

Utiliser quand :

- données trop faibles ;
- GSC en retard ;
- page fraîchement publiée ;
- aucune impression exploitable.

## INDEXATION_ACTION

Utiliser quand :

- page non connue ;
- page crawlée mais pas encore indexée ;
- sitemap vient d’être mis à jour ;
- page stratégique nécessite inspection.

## CTR_ACTION

Utiliser quand :

- position correcte ;
- impressions suffisantes ;
- CTR faible ;
- snippet améliorable.

Action : title/meta/snippet avant réécriture lourde.

## CONTENT_REINFORCEMENT

Utiliser quand :

- positions 11–20 ;
- intention correcte ;
- contenu un peu faible ;
- maillage insuffisant.

## CANNIBALIZATION_REVIEW

Utiliser quand :

- plusieurs URL ont des impressions sur la même requête ;
- intention se chevauche ;
- Google alterne entre deux pages.

## TECHNICAL_FIX

Utiliser uniquement si :

- noindex accidentel ;
- mauvaise canonical ;
- sitemap incorrect ;
- 404 ;
- redirection ;
- robots ;
- erreur serveur ;
- problème technique réel.

---

# 18. Matrice de décision opérationnelle

Toujours classer les tâches restantes dans :

## CAN_DO_NOW

- technique ;
- metadata ;
- maillage ;
- sitemap ;
- schema ;
- tests ;
- performance évidente ;
- trust pages ;
- health check.

## WAIT_FOR_GSC

- CTR ;
- positions ;
- requêtes ;
- cannibalisation réelle ;
- contenu à renforcer ;
- prochain article basé sur la demande réelle.

## MANUAL

- inspection URL ;
- demande d’indexation ;
- validation email ;
- soumission d’un backlink ;
- partenariat ;
- fiche entreprise ;
- compte tiers.

## FUTURE

- nouvelles pages métiers ;
- nouveaux clusters ;
- études propriétaires ;
- outils gratuits ;
- nouveaux linkable assets ;
- international ;
- gros travail de backlinks.

---

# 19. Ce qu’il ne faut jamais faire

- changer 20 pages en même temps sans baseline ;
- publier 10 articles/jour ;
- créer une page pour chaque mot-clé ;
- créer des pages villes quasi identiques ;
- utiliser des données non vérifiées ;
- inventer des avis ;
- inventer des résultats ;
- promettre Google ;
- modifier une page tous les jours ;
- réagir à 0 impression après 24 h ;
- fusionner / rediriger sans analyser l’intention ;
- acheter des liens en masse ;
- optimiser uniquement le score Lighthouse ;
- oublier la production réelle ;
- laisser des drafts indexables ;
- laisser les routes privées dans le sitemap ;
- faire du contenu IA non relu et sans valeur ajoutée.

---

# 20. Workflow maître à appliquer à tout nouveau site

## LOT 1 — Audit technique sans modification

Livrable : état réel + risques + priorités.

## LOT 2 — OpenSEO concurrence / keywords / backlinks

Livrable : concurrents, gaps, P1, baseline backlinks.

## LOT 3 — Money pages

Livrable : pages business optimisées sans cannibalisation.

## LOT 4 — QA locale

Livrable : lint, typecheck, tests, build, Lighthouse, canonical, schema.

## LOT 5 — Release

Livrable : commit propre + QA production.

## LOT 6 — GSC + sitemap

Livrable : property connectée, sitemap, indexation prioritaire, baseline.

## LOT 7 — Article P1

Livrable : un seul article ciblé, d’abord draft.

## LOT 8 — Revue éditoriale

Livrable : publication locale prête.

## LOT 9 — Release article

Livrable : article production + sitemap + QA.

## LOT 10 — Linkable asset + backlinks

Livrable : asset utile + prospect list.

## LOT 11 — Hardening SEO

Livrable : crawl complet + health check automatisé.

## LOT 12 — Pilotage GSC

Livrable : WAIT / INDEXATION_ACTION / CTR_ACTION / CONTENT_REINFORCEMENT / CANNIBALIZATION_REVIEW / TECHNICAL_FIX.

---

# 21. Format standard des rapports Codex

Chaque prompt doit se terminer par un rapport structuré.

Format recommandé :

A. OBJECTIVE STATUS
B. FINDINGS
C. CHANGES
D. TESTS
E. PRODUCTION CHECK
F. RISKS
G. NEXT ACTION
H. STATUS
I. CONFIRMATION

Toujours une seule prochaine action.

---

# 22. Garde-fous de release

Avant commit :

- lint PASS ;
- typecheck PASS ;
- tests PASS ;
- build PASS ;
- diff check PASS ;
- seo:check PASS si disponible ;
- QA mobile ;
- QA desktop ;
- aucun fichier hors scope staged.

Après push :

- production 200 ;
- canonical correcte ;
- sitemap correct ;
- robots correct ;
- nouvel élément visible ;
- aucun ancien domaine ;
- aucune ancienne offre ;
- aucune régression Lighthouse majeure.

---

# 23. Résumé exécutable en une phrase

> Construire d’abord une base technique propre, cartographier les intentions avec OpenSEO, optimiser les money pages, connecter GSC, publier peu mais utile, renforcer le maillage, créer un asset partageable, obtenir des liens propres, automatiser les contrôles, puis laisser les vraies données Google dicter la suite.

---

# 24. Checklist finale pour nouveau projet

## Technique

- [ ] Domaine officiel défini
- [ ] HTTPS
- [ ] Canonicals propres
- [ ] Sitemap propre
- [ ] Robots propre
- [ ] 404 réelles
- [ ] Noindex volontaire
- [ ] Aucun ancien domaine/offre
- [ ] Routes privées exclues

## Architecture

- [ ] Une intention par URL
- [ ] Money pages identifiées
- [ ] Aucune page orpheline importante
- [ ] Maillage vers money pages
- [ ] Pas de cannibalisation évidente

## OpenSEO

- [ ] Projet créé
- [ ] Concurrents analysés
- [ ] Keyword gap
- [ ] P1 identifié
- [ ] Backlinks baseline

## GSC

- [ ] Property connectée
- [ ] Sitemap soumis
- [ ] Money pages inspectées
- [ ] Baseline créée
- [ ] Cadence J+3 / J+7 / J+14 / J+28

## Contenu

- [ ] Article P1
- [ ] Sources
- [ ] CTA
- [ ] GEO/AEO
- [ ] Maillage
- [ ] Draft avant release

## Autorité

- [ ] Linkable asset
- [ ] Prospects backlinks
- [ ] Pas de spam
- [ ] Tracking des liens

## Automatisation

- [ ] `npm run seo:check`
- [ ] tests de régression SEO
- [ ] QA production après chaque release

## Pilotage

- [ ] WAIT si données insuffisantes
- [ ] CTR_ACTION si impressions + faible CTR
- [ ] CONTENT_REINFORCEMENT si positions 11–20
- [ ] CANNIBALIZATION_REVIEW si plusieurs URL sur même requête
- [ ] TECHNICAL_FIX uniquement sur problème technique réel

---

# 25. Versioning de la méthode

Nom recommandé du skill :

`SKILL_SEO_MASTER_CODEX_OPENSEO_GSC.md`

Version : 1.0

Cette méthode doit évoluer à partir des résultats réels des projets. Toute nouvelle règle doit venir d’un cas concret, d’une donnée GSC, d’un comportement observé en production ou d’une documentation fiable — pas d’une intuition isolée.
