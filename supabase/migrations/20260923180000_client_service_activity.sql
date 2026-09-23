-- FeaseWeb V6: manually managed service activity visible to the client.
-- This is deliberately separate from activity_log, which remains an internal audit log.

create type public.client_update_category as enum ('seo','contenu','maintenance','site','securite','autre');
create type public.client_update_status as enum ('prevu','en_cours','termine');

create table public.client_updates (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  site_id uuid references public.sites(id) on delete set null,
  category public.client_update_category not null,
  title text not null check (char_length(title) between 1 and 180),
  description text not null check (char_length(description) between 1 and 5000),
  status public.client_update_status not null default 'termine',
  visible_to_client boolean not null default false,
  activity_date date not null default current_date,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index client_updates_client_date_idx on public.client_updates(client_id, activity_date desc, created_at desc);
create index client_updates_visible_idx on public.client_updates(client_id, visible_to_client, activity_date desc);

create trigger client_updates_updated_at before update on public.client_updates
for each row execute function public.set_updated_at();

alter table public.client_updates enable row level security;
grant select, insert, update, delete on public.client_updates to authenticated;

create policy client_updates_admin_all on public.client_updates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy client_updates_self_select on public.client_updates for select to authenticated
  using (
    visible_to_client = true and exists (
      select 1 from public.clients c where c.id = client_id and c.user_id = (select auth.uid())
    )
  );

-- A title keeps a request understandable in both the admin and client spaces.
alter table public.modification_requests add column if not exists title text;
update public.modification_requests set title = category where title is null;
alter table public.modification_requests alter column title set default 'Demande client';
alter table public.modification_requests alter column title set not null;
alter table public.modification_requests add constraint modification_requests_title_check check (char_length(title) between 1 and 180);
create index if not exists modification_requests_client_date_idx on public.modification_requests(client_id, created_at desc);
