-- FeaseWeb V4: PostgreSQL, Supabase Auth and RLS.
-- Apply with `supabase db push` or the Supabase SQL migration workflow.

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'client');
create type public.prospect_status as enum ('nouveau','a_contacter','contacte','qualifie','preview_en_cours','preview_envoyee','gagne','perdu');
create type public.client_status as enum ('actif','en_attente','suspendu','resilie');
create type public.site_status as enum ('a_preparer','en_creation','preview','corrections','valide','mise_en_ligne','actif','suspendu','archive');
create type public.subscription_status as enum ('incomplet','actif','retard','impaye','annule');
create type public.payment_status as enum ('paye','en_attente','echoue','rembourse');
create type public.request_status as enum ('recue','en_cours','besoin_information','terminee','hors_perimetre');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'client',
  first_name text,
  last_name text,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text not null check (char_length(first_name) between 1 and 100),
  last_name text not null check (char_length(last_name) between 1 and 100),
  company text not null check (char_length(company) between 1 and 180),
  email text not null check (char_length(email) <= 320),
  phone text check (phone is null or char_length(phone) <= 40),
  activity text check (activity is null or char_length(activity) <= 180),
  city text check (city is null or char_length(city) <= 120),
  existing_site_url text check (existing_site_url is null or char_length(existing_site_url) <= 2048),
  has_existing_site boolean not null default false,
  objective text check (objective is null or char_length(objective) <= 1000),
  message text check (message is null or char_length(message) <= 5000),
  source text not null default 'site FeaseWeb',
  status public.prospect_status not null default 'nouveau',
  privacy_consent boolean not null default false check (privacy_consent = true),
  privacy_consent_at timestamptz not null default now(),
  privacy_policy_version text not null default 'v1'
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  prospect_id uuid unique references public.prospects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  company text not null,
  email text not null,
  phone text,
  status public.client_status not null default 'en_attente',
  started_at timestamptz
);

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  slug text not null unique,
  preview_url text,
  production_url text,
  domain text,
  repository text,
  hosting_provider text,
  status public.site_status not null default 'a_preparer',
  created_at timestamptz not null default now(),
  launched_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  provider text not null default 'none' check (provider in ('none','stripe')),
  external_customer_id text unique,
  external_subscription_id text unique,
  amount_cents integer not null default 4900 check (amount_cents >= 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  status public.subscription_status not null default 'incomplet',
  started_at timestamptz,
  next_billing_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  status public.payment_status not null,
  invoice_reference text,
  period_start date,
  period_end date,
  provider text not null default 'none',
  external_reference text unique,
  created_at timestamptz not null default now()
);

create table public.modification_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  category text not null,
  message text not null,
  attachments jsonb not null default '[]'::jsonb,
  priority text not null default 'normale' check (priority in ('basse','normale','haute')),
  status public.request_status not null default 'recue',
  internal_reply text,
  resolved_at timestamptz
);

create table public.seo_actions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  date timestamptz not null default now(),
  action text not null,
  description text,
  status text not null default 'terminee' check (status in ('a_faire','en_cours','terminee'))
);

create table public.seo_metrics (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  clicks integer check (clicks is null or clicks >= 0),
  impressions integer check (impressions is null or impressions >= 0),
  ctr numeric check (ctr is null or ctr between 0 and 100),
  average_position numeric check (average_position is null or average_position >= 0),
  synced_at timestamptz
);

create table public.domains (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  domain text not null unique,
  registrar text,
  owner text,
  expiration_date date,
  renewal text not null default 'manuel' check (renewal in ('manuel','automatique')),
  dns_status text not null default 'a_configurer' check (dns_status in ('a_configurer','configure','probleme')),
  ssl_status text not null default 'a_verifier' check (ssl_status in ('actif','a_verifier','inactif')),
  notes text
);

create table public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  prospect_id uuid references public.prospects(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  check ((client_id is not null) or (prospect_id is not null))
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  entity_type text not null,
  entity_id uuid not null,
  message text not null,
  occurred_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index prospects_status_created_idx on public.prospects(status, created_at desc);
create index prospects_email_idx on public.prospects(lower(email));
create index prospects_company_idx on public.prospects(lower(company));
create index clients_status_idx on public.clients(status);
create index clients_company_idx on public.clients(lower(company));
create index sites_client_status_idx on public.sites(client_id, status);
create index requests_client_status_idx on public.modification_requests(client_id, status);
create index seo_actions_site_date_idx on public.seo_actions(site_id, date desc);
create index payments_client_created_idx on public.payments(client_id, created_at desc);
create index activity_entity_idx on public.activity_log(entity_type, entity_id, occurred_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger prospects_updated_at before update on public.prospects for each row execute function public.set_updated_at();
create trigger clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
create trigger sites_updated_at before update on public.sites for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger requests_updated_at before update on public.modification_requests for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name')
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

create or replace function public.convert_prospect(p_prospect_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  p public.prospects;
  c public.clients;
  s public.sites;
  site_slug text;
begin
  if not public.is_admin() then raise exception using errcode = '42501', message = 'admin role required'; end if;
  select * into p from public.prospects where id = p_prospect_id for update;
  if p.id is null then raise exception using errcode = 'P0002', message = 'prospect not found'; end if;
  select * into c from public.clients where prospect_id = p.id;
  if c.id is not null then
    select * into s from public.sites where client_id = c.id order by created_at limit 1;
    return jsonb_build_object('client_id', c.id, 'site_id', s.id, 'created', false);
  end if;
  insert into public.clients (prospect_id, first_name, last_name, company, email, phone, status, started_at)
  values (p.id, p.first_name, p.last_name, p.company, p.email, p.phone, 'en_attente', null) returning * into c;
  site_slug := trim(both '-' from regexp_replace(lower(p.company), '[^a-z0-9]+', '-', 'g'));
  if site_slug = '' then site_slug := 'site'; end if;
  site_slug := site_slug || '-' || substring(replace(c.id::text, '-', '') from 1 for 8);
  insert into public.sites (client_id, name, slug, status) values (c.id, p.company, site_slug, 'a_preparer') returning * into s;
  update public.prospects set status = 'gagne' where id = p.id;
  insert into public.activity_log (actor_id, entity_type, entity_id, message) values ((select auth.uid()), 'prospect', p.id, 'Prospect converti en client.');
  return jsonb_build_object('client_id', c.id, 'site_id', s.id, 'created', true);
end;
$$;

-- New users get the least-privileged role. Bootstrap the first admin manually.
alter table public.profiles enable row level security;
alter table public.prospects enable row level security;
alter table public.clients enable row level security;
alter table public.sites enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.modification_requests enable row level security;
alter table public.seo_actions enable row level security;
alter table public.seo_metrics enable row level security;
alter table public.domains enable row level security;
alter table public.internal_notes enable row level security;
alter table public.activity_log enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select, insert, update, delete on public.profiles, public.prospects, public.clients, public.sites, public.subscriptions, public.payments, public.modification_requests, public.seo_actions, public.seo_metrics, public.domains, public.internal_notes, public.activity_log to authenticated;
grant execute on function public.convert_prospect(uuid) to authenticated;

create policy profiles_self_select on public.profiles for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy profiles_admin_all on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy prospects_admin_all on public.prospects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy clients_admin_all on public.clients for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy clients_self_select on public.clients for select to authenticated using (user_id = (select auth.uid()));
create policy sites_admin_all on public.sites for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy sites_self_select on public.sites for select to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.user_id = (select auth.uid())));
create policy subscriptions_admin_all on public.subscriptions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy subscriptions_self_select on public.subscriptions for select to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.user_id = (select auth.uid())));
create policy payments_admin_all on public.payments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy payments_self_select on public.payments for select to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.user_id = (select auth.uid())));
create policy requests_admin_all on public.modification_requests for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy requests_self_select on public.modification_requests for select to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.user_id = (select auth.uid())));
create policy requests_self_insert on public.modification_requests for insert to authenticated with check (exists (select 1 from public.clients c where c.id = client_id and c.user_id = (select auth.uid())));
create policy requests_self_update on public.modification_requests for update to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.user_id = (select auth.uid()))) with check (exists (select 1 from public.clients c where c.id = client_id and c.user_id = (select auth.uid())));
create policy seo_actions_admin_all on public.seo_actions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy seo_actions_self_select on public.seo_actions for select to authenticated using (exists (select 1 from public.sites s join public.clients c on c.id = s.client_id where s.id = site_id and c.user_id = (select auth.uid())));
create policy seo_metrics_admin_all on public.seo_metrics for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy seo_metrics_self_select on public.seo_metrics for select to authenticated using (exists (select 1 from public.sites s join public.clients c on c.id = s.client_id where s.id = site_id and c.user_id = (select auth.uid())));
create policy domains_admin_all on public.domains for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy domains_self_select on public.domains for select to authenticated using (exists (select 1 from public.clients c where c.id = client_id and c.user_id = (select auth.uid())));
create policy internal_notes_admin_all on public.internal_notes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy activity_admin_all on public.activity_log for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.handle_new_user() from public;
revoke all on function public.convert_prospect(uuid) from public;
