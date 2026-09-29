-- Additive compatibility layer for selecting several visual directions.
-- The legacy style_direction column remains available for old rows and integrations.
alter table public.project_intakes
  add column if not exists style_directions text[] not null default '{}'::text[];

alter table public.project_intakes
  drop constraint if exists project_intakes_style_directions_check;

alter table public.project_intakes
  add constraint project_intakes_style_directions_check
  check (style_directions <@ array['elegant_premium','moderne_epure','artisan_rassurant','dynamique_commercial','sobre_professionnel','chaleureux_humain']::text[]);

grant update (style_directions) on public.project_intakes to authenticated;
