-- Référence PostgreSQL V1. À migrer via un outil de migration avant production.
create extension if not exists pgcrypto;

create type user_role as enum ('admin', 'client');
create type prospect_status as enum ('nouveau','a_contacter','contacte','qualifie','preview_en_cours','preview_envoyee','gagne','perdu');
create type client_status as enum ('actif','en_attente','suspendu','resilie');
create type site_status as enum ('a_preparer','en_creation','preview','corrections','valide','mise_en_ligne','actif','suspendu','archive');
create type subscription_status as enum ('incomplet','actif','retard','impaye','annule');
create type payment_status as enum ('paye','en_attente','echoue','rembourse');
create type request_status as enum ('recue','en_cours','besoin_information','terminee','hors_perimetre');

create table users (id uuid primary key default gen_random_uuid(), email text not null unique, role user_role not null, client_id uuid, created_at timestamptz not null default now());
create table prospects (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), first_name text not null, last_name text not null, company text not null, email text not null, phone text, activity text, city text, current_site text, has_site boolean not null default false, objective text, message text, source text, status prospect_status not null default 'nouveau');
create table clients (id uuid primary key default gen_random_uuid(), prospect_id uuid unique references prospects(id), user_id uuid unique references users(id), first_name text not null, last_name text not null, company text not null, email text not null, phone text, started_at timestamptz, status client_status not null default 'en_attente', offer text not null default 'FeaseWeb — 49 €/mois');
alter table users add constraint users_client_fk foreign key (client_id) references clients(id);
create table sites (id uuid primary key default gen_random_uuid(), client_id uuid not null references clients(id), name text not null, slug text not null unique, preview_url text, final_domain text, repository text, host text, created_at timestamptz not null default now(), published_at timestamptz, status site_status not null default 'a_preparer', technical_notes text);
create table subscriptions (id uuid primary key default gen_random_uuid(), client_id uuid not null references clients(id), status subscription_status not null default 'incomplet', amount_cents integer not null default 4900, started_at timestamptz, next_due_at timestamptz, provider text not null default 'none', external_customer_id text unique, external_subscription_id text unique, last_payment_status payment_status);
create table payments (id uuid primary key default gen_random_uuid(), client_id uuid not null references clients(id), amount_cents integer not null, paid_at timestamptz, status payment_status not null, invoice text, period text, provider text not null default 'none', external_reference text unique);
create table modification_requests (id uuid primary key default gen_random_uuid(), client_id uuid not null references clients(id), site_id uuid not null references sites(id), created_at timestamptz not null default now(), category text not null, message text not null, attachments jsonb not null default '[]', priority text not null default 'normale', status request_status not null default 'recue', internal_reply text, resolved_at timestamptz);
create table seo_actions (id uuid primary key default gen_random_uuid(), site_id uuid not null references sites(id), date timestamptz not null default now(), action text not null, description text, status text not null default 'terminee');
create table seo_metrics (id uuid primary key default gen_random_uuid(), site_id uuid not null references sites(id), clicks integer, impressions integer, ctr numeric, average_position numeric, synced_at timestamptz);
create table domains (id uuid primary key default gen_random_uuid(), client_id uuid not null references clients(id), name text not null unique, registrar text, owner text, expires_at date, renewal text, dns_status text, ssl text, notes text);
create table internal_notes (id uuid primary key default gen_random_uuid(), client_id uuid references clients(id), prospect_id uuid references prospects(id), author_id uuid references users(id), body text not null, created_at timestamptz not null default now());
create table activity_log (id uuid primary key default gen_random_uuid(), actor_id uuid references users(id), entity_type text not null, entity_id uuid not null, message text not null, occurred_at timestamptz not null default now());

create index clients_status_idx on clients(status);
create index sites_status_idx on sites(status);
create index requests_status_idx on modification_requests(status);
create index activity_entity_idx on activity_log(entity_type, entity_id, occurred_at desc);
