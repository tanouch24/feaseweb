# FeaseWeb — site public et back-office

Application Next.js/TypeScript/Tailwind du site FeaseWeb et de son back-office.
Le frontend public est conservé, tandis que le lot V4 prépare le backend réel
Supabase/PostgreSQL, Supabase Auth, RLS et les formulaires serveur. Stripe et
Search Console ne sont pas connectés.

## Lancer le projet

```bash
npm install
npm run dev
```

Sans variables Supabase, les routes protégées indiquent une configuration
manquante et aucune donnée métier n'est simulée. Voir
[`docs/backoffice/supabase-setup.md`](docs/backoffice/supabase-setup.md).

Ouvrir [http://localhost:3000](http://localhost:3000).

## Commandes

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run lint` — ESLint
- `npm run typecheck` — vérification TypeScript
- `npm test` — suite de tests (Vitest + React Testing Library)

## Documentation

- Spec : `docs/superpowers/specs/2026-09-22-feaseweb-homepage-design.md`
- Plan d'implémentation : `docs/superpowers/plans/2026-09-22-feaseweb-maquette.md`
