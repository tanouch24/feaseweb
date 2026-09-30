-- Canonical project continuity for sites and client notifications.
-- Local migration only for this lot; do not apply remotely without review.
begin;

alter table public.sites
  add column if not exists project_intake_id uuid;

alter table public.client_updates
  add column if not exists project_intake_id uuid;

alter table public.sites alter column client_id drop not null;
alter table public.client_updates alter column client_id drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'sites_project_intake_id_fkey'
      and conrelid = 'public.sites'::regclass
  ) then
    alter table public.sites
      add constraint sites_project_intake_id_fkey
      foreign key (project_intake_id)
      references public.project_intakes(id)
      on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'client_updates_project_intake_id_fkey'
      and conrelid = 'public.client_updates'::regclass
  ) then
    alter table public.client_updates
      add constraint client_updates_project_intake_id_fkey
      foreign key (project_intake_id)
      references public.project_intakes(id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'sites_project_or_client_check' and conrelid = 'public.sites'::regclass) then
    alter table public.sites add constraint sites_project_or_client_check
      check (project_intake_id is not null or client_id is not null);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'client_updates_project_or_client_check' and conrelid = 'public.client_updates'::regclass) then
    alter table public.client_updates add constraint client_updates_project_or_client_check
      check (project_intake_id is not null or client_id is not null);
  end if;
end $$;

create index if not exists sites_project_intake_id_idx
  on public.sites(project_intake_id);

create index if not exists client_updates_project_intake_date_idx
  on public.client_updates(project_intake_id, activity_date desc, created_at desc);

create unique index if not exists client_updates_intake_idempotency_idx
  on public.client_updates(created_by, project_intake_id, idempotency_key)
  where project_intake_id is not null and idempotency_key is not null;

do $$
declare
  site_backfillable bigint;
  site_ambiguous bigint;
  site_unresolved bigint;
  update_backfillable bigint;
  update_ambiguous bigint;
  update_unresolved bigint;
begin
  select
    count(*) filter (where matches.count = 1),
    count(*) filter (where matches.count > 1),
    count(*) filter (where matches.count = 0)
  into site_backfillable, site_ambiguous, site_unresolved
  from public.sites s
  cross join lateral (
    select count(*)::bigint
    from public.project_intakes p
    where p.client_id = s.client_id
  ) matches
  where s.project_intake_id is null and s.client_id is not null;

  select
    count(*) filter (where matches.count = 1),
    count(*) filter (where matches.count > 1),
    count(*) filter (where matches.count = 0)
  into update_backfillable, update_ambiguous, update_unresolved
  from public.client_updates u
  cross join lateral (
    select count(*)::bigint
    from public.project_intakes p
    where p.client_id = u.client_id
  ) matches
  where u.project_intake_id is null and u.client_id is not null;

  raise notice 'canonical site backfill: backfillable=%, ambiguous=%, unresolved=%', site_backfillable, site_ambiguous, site_unresolved;
  raise notice 'canonical update backfill: backfillable=%, ambiguous=%, unresolved=%', update_backfillable, update_ambiguous, update_unresolved;
end $$;

-- Deterministic backfill: project_intakes.client_id is unique in the
-- existing schema, so only an exact client -> intake match is accepted.
update public.sites as s
set project_intake_id = p.id
from public.project_intakes as p
where s.project_intake_id is null
  and p.client_id = s.client_id;

update public.client_updates as u
set project_intake_id = p.id
from public.project_intakes as p
where u.project_intake_id is null
  and p.client_id = u.client_id;

-- Pass 2: use the explicit prospect relation created by the conversion flow.
-- Both sides are unique in the existing schema; the count guards keep this
-- safe if that invariant is ever relaxed later.
update public.sites as s
set project_intake_id = p.id
from public.clients as c
join public.project_intakes as p on p.prospect_id = c.prospect_id
where s.project_intake_id is null
  and s.client_id = c.id
  and c.prospect_id is not null
  and (select count(*) from public.clients c2 where c2.prospect_id = c.prospect_id) = 1
  and (select count(*) from public.project_intakes p2 where p2.prospect_id = c.prospect_id) = 1;

update public.client_updates as u
set project_intake_id = p.id
from public.clients as c
join public.project_intakes as p on p.prospect_id = c.prospect_id
where u.project_intake_id is null
  and u.client_id = c.id
  and c.prospect_id is not null
  and (select count(*) from public.clients c2 where c2.prospect_id = c.prospect_id) = 1
  and (select count(*) from public.project_intakes p2 where p2.prospect_id = c.prospect_id) = 1;

-- Pass 3: exact, normalized email only when it is unique on both sides.
-- Names, companies and phone numbers are intentionally never used here.
update public.sites as s
set project_intake_id = p.id
from public.clients as c
join public.project_intakes as p
  on lower(trim(p.email)) = lower(trim(c.email))
where s.project_intake_id is null
  and s.client_id = c.id
  and c.email is not null
  and p.email is not null
  and (select count(*) from public.clients c2 where lower(trim(c2.email)) = lower(trim(c.email))) = 1
  and (select count(*) from public.project_intakes p2 where lower(trim(p2.email)) = lower(trim(p.email))) = 1;

update public.client_updates as u
set project_intake_id = p.id
from public.clients as c
join public.project_intakes as p
  on lower(trim(p.email)) = lower(trim(c.email))
where u.project_intake_id is null
  and u.client_id = c.id
  and c.email is not null
  and p.email is not null
  and (select count(*) from public.clients c2 where lower(trim(c2.email)) = lower(trim(c.email))) = 1
  and (select count(*) from public.project_intakes p2 where lower(trim(p2.email)) = lower(trim(p.email))) = 1;

do $$
declare
  site_unresolved bigint;
  update_unresolved bigint;
begin
  select count(*) into site_unresolved
  from public.sites
  where project_intake_id is null;
  select count(*) into update_unresolved
  from public.client_updates
  where project_intake_id is null;
  raise notice 'canonical post-strategy unresolved: sites=%, client_updates=%', site_unresolved, update_unresolved;
end $$;

-- Keep the legacy conversion RPC compatible with the canonical intake link.
-- Existing intake-owned sites are adopted by the newly-created client rather
-- than duplicated. The function remains admin-only and keeps its public shape.
create or replace function public.convert_prospect(p_prospect_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  p public.prospects;
  c public.clients;
  s public.sites;
  intake public.project_intakes;
  site_slug text;
begin
  if not public.is_admin() then raise exception using errcode = '42501', message = 'admin role required'; end if;
  select * into p from public.prospects where id = p_prospect_id for update;
  if p.id is null then raise exception using errcode = 'P0002', message = 'prospect not found'; end if;
  select * into intake from public.project_intakes where prospect_id = p.id order by created_at limit 1;
  select * into c from public.clients where prospect_id = p.id;
  if c.id is not null then
    if intake.id is not null then
      update public.project_intakes set client_id = c.id where id = intake.id;
    end if;
    select * into s from public.sites
      where (intake.id is not null and project_intake_id = intake.id) or client_id = c.id
      order by (case when intake.id is not null and project_intake_id = intake.id then 0 else 1 end), created_at
      limit 1;
    if s.id is not null and intake.id is not null then
      update public.sites set project_intake_id = intake.id, client_id = c.id where id = s.id returning * into s;
    end if;
    return jsonb_build_object('client_id', c.id, 'site_id', s.id, 'created', false);
  end if;
  insert into public.clients (prospect_id, first_name, last_name, company, email, phone, status, started_at)
  values (p.id, p.first_name, p.last_name, p.company, p.email, p.phone, 'en_attente', null) returning * into c;
  if intake.id is not null then
    select * into s from public.sites where project_intake_id = intake.id order by created_at limit 1;
  end if;
  if s.id is null then
    select * into s from public.sites where client_id = c.id order by created_at limit 1;
  end if;
  if s.id is null then
    site_slug := trim(both '-' from regexp_replace(lower(p.company), '[^a-z0-9]+', '-', 'g'));
    if site_slug = '' then site_slug := 'site'; end if;
    site_slug := site_slug || '-' || substring(replace(c.id::text, '-', '') from 1 for 8);
    insert into public.sites (project_intake_id, client_id, name, slug, status)
      values (intake.id, c.id, p.company, site_slug, 'a_preparer') returning * into s;
  else
    update public.sites set project_intake_id = coalesce(project_intake_id, intake.id), client_id = c.id where id = s.id returning * into s;
  end if;
  if intake.id is not null then
    update public.project_intakes set client_id = c.id where id = intake.id;
  end if;
  update public.prospects set status = 'gagne' where id = p.id;
  insert into public.activity_log (actor_id, entity_type, entity_id, message) values ((select auth.uid()), 'prospect', p.id, 'Prospect converti en client.');
  return jsonb_build_object('client_id', c.id, 'site_id', s.id, 'created', true);
end;
$$;

-- Preserve the existing admin policies and grants. Replace only the
-- authenticated read policies so project_intake_id is the preferred owner
-- relation while client_id remains a legacy fallback.
drop policy if exists sites_self_select on public.sites;
create policy sites_self_select on public.sites
  for select to authenticated
  using (
    exists (
      select 1 from public.project_intakes p
      where p.id = project_intake_id
        and p.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.clients c
      where c.id = client_id
        and c.user_id = (select auth.uid())
    )
  );

drop policy if exists client_updates_self_select on public.client_updates;
create policy client_updates_self_select on public.client_updates
  for select to authenticated
  using (
    visible_to_client = true
    and (
      exists (
        select 1 from public.project_intakes p
        where p.id = project_intake_id
          and p.user_id = (select auth.uid())
      )
      or exists (
        select 1 from public.clients c
        where c.id = client_id
          and c.user_id = (select auth.uid())
      )
    )
  );

commit;
