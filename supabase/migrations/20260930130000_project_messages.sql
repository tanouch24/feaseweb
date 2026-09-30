-- Intake-first client messages. Local migration only; do not apply remotely
-- until the production schema and backfill have been audited.
begin;

create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_intake_id uuid not null references public.project_intakes(id) on delete cascade,
  sender_type text not null check (sender_type in ('client', 'admin')),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  legacy_source text check (legacy_source is null or legacy_source = 'support_message')
);

create index if not exists project_messages_intake_created_idx
  on public.project_messages(project_intake_id, created_at desc);

create index if not exists project_messages_unread_idx
  on public.project_messages(project_intake_id, read_at)
  where read_at is null;

create unique index if not exists project_messages_legacy_source_idx
  on public.project_messages(project_intake_id, legacy_source)
  where legacy_source is not null;

-- Preserve the historical single-field message without deleting or changing it.
-- The partial unique index makes this backfill idempotent.
insert into public.project_messages (project_intake_id, sender_type, message, created_at, legacy_source)
select id, 'client', support_message, coalesce(support_requested_at, created_at), 'support_message'
from public.project_intakes
where nullif(trim(support_message), '') is not null
  and not exists (
    select 1 from public.project_messages m
    where m.project_intake_id = project_intakes.id
      and m.legacy_source = 'support_message'
  );

alter table public.project_messages enable row level security;
revoke all on public.project_messages from anon;
grant select, insert, update on public.project_messages to authenticated;

drop policy if exists project_messages_admin_all on public.project_messages;
create policy project_messages_admin_all on public.project_messages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists project_messages_owner_select on public.project_messages;
create policy project_messages_owner_select on public.project_messages
  for select to authenticated
  using (exists (
    select 1 from public.project_intakes p
    where p.id = project_intake_id and p.user_id = (select auth.uid())
  ));

drop policy if exists project_messages_owner_insert on public.project_messages;
create policy project_messages_owner_insert on public.project_messages
  for insert to authenticated
  with check (
    sender_type = 'client'
    and exists (
      select 1 from public.project_intakes p
      where p.id = project_intake_id and p.user_id = (select auth.uid())
    )
  );

commit;
