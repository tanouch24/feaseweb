-- Additive compatibility layer for onboarding multi-selection.
-- The legacy primary_objective column remains the source for old rows.
alter table public.project_intakes
  add column if not exists primary_objectives text[] not null default '{}'::text[];

alter table public.project_intakes
  drop constraint if exists project_intakes_primary_objectives_check;

alter table public.project_intakes
  add constraint project_intakes_primary_objectives_check
  check (primary_objectives <@ array['devis','appels','presentation','rendez_vous','vente','visite']::text[]);

grant update (primary_objectives) on public.project_intakes to authenticated;
