-- FeaseWeb: post-payment production dossier and private client media.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'project_intakes_id_client_key'
  ) then
    alter table public.project_intakes
      add constraint project_intakes_id_client_key unique (id, client_id);
  end if;
end $$;

create table if not exists public.production_dossiers (
  id uuid primary key default gen_random_uuid(),
  project_intake_id uuid not null unique,
  client_id uuid not null unique references public.clients(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  current_step smallint not null default 1 check (current_step between 1 and 7),
  completed_at timestamptz,
  confirmed_at timestamptz,
  public_name text check (public_name is null or char_length(public_name) between 1 and 180),
  business_description text check (business_description is null or char_length(business_description) <= 2000),
  public_address text check (public_address is null or char_length(public_address) <= 300),
  address_public boolean not null default true,
  public_city text check (public_city is null or char_length(public_city) <= 120),
  service_areas text[] not null default '{}'::text[],
  public_phone text check (public_phone is null or char_length(public_phone) <= 40),
  public_email text check (public_email is null or char_length(public_email) <= 320),
  opening_hours jsonb not null default '{}'::jsonb,
  social_urls text[] not null default '{}'::text[],
  services jsonb not null default '[]'::jsonb,
  requested_pages text[] not null default '{}'::text[],
  priority_services text[] not null default '{}'::text[],
  differentiators text[] not null default '{}'::text[],
  primary_cta text check (primary_cta in ('devis','appel','rendez_vous','message','visite')),
  requested_features text[] not null default '{}'::text[],
  content_preferences jsonb not null default '{}'::jsonb,
  seo_primary_activity text check (seo_primary_activity is null or char_length(seo_primary_activity) <= 180),
  seo_priority_services text[] not null default '{}'::text[],
  seo_primary_city text check (seo_primary_city is null or char_length(seo_primary_city) <= 120),
  seo_secondary_areas text[] not null default '{}'::text[],
  seo_audience text check (seo_audience is null or char_length(seo_audience) <= 1000),
  seo_reference_urls text[] not null default '{}'::text[],
  legal_name text check (legal_name is null or char_length(legal_name) <= 180),
  legal_form text check (legal_form is null or char_length(legal_form) <= 120),
  siren_siret text check (siren_siret is null or char_length(siren_siret) <= 30),
  legal_address text check (legal_address is null or char_length(legal_address) <= 300),
  technical_domain text check (technical_domain is null or char_length(technical_domain) <= 255),
  technical_registrar text check (technical_registrar is null or char_length(technical_registrar) <= 180),
  technical_host text check (technical_host is null or char_length(technical_host) <= 180),
  technical_cms text check (technical_cms is null or char_length(technical_cms) <= 120),
  technical_access jsonb not null default '{}'::jsonb,
  rights_confirmed boolean not null default false,
  client_confirmation boolean not null default false
);

create index if not exists production_dossiers_client_idx on public.production_dossiers(client_id);
create index if not exists production_dossiers_updated_idx on public.production_dossiers(updated_at desc);
drop trigger if exists production_dossiers_updated_at on public.production_dossiers;
create trigger production_dossiers_updated_at before update on public.production_dossiers for each row execute function public.set_updated_at();

alter table public.production_dossiers enable row level security;
revoke all on public.production_dossiers from authenticated;
grant select on public.production_dossiers to authenticated;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'production_dossiers_project_client_fk') then
    alter table public.production_dossiers
      add constraint production_dossiers_project_client_fk
      foreign key (project_intake_id, client_id)
      references public.project_intakes(id, client_id)
      on delete cascade;
  end if;
end $$;
drop policy if exists production_dossiers_admin_all on public.production_dossiers;
create policy production_dossiers_admin_all on public.production_dossiers for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists production_dossiers_client_select on public.production_dossiers;
create policy production_dossiers_client_select on public.production_dossiers for select to authenticated
  using (exists (
    select 1 from public.profiles profile
    join public.clients c on c.user_id = profile.id
    where profile.id = (select auth.uid())
      and profile.role = 'client'
      and c.id = client_id
  ));
drop policy if exists production_dossiers_client_insert on public.production_dossiers;
drop policy if exists production_dossiers_client_update on public.production_dossiers;


create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_intake_id uuid not null,
  storage_path text not null unique,
  original_name text not null check (char_length(original_name) between 1 and 255),
  media_type text not null check (media_type in ('logo','photo','realisation','avis_document','certification','document_utile')),
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','image/gif','application/pdf')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  status text not null default 'recu' check (status in ('recu','valide','a_verifier','refuse')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(client_id, project_intake_id, original_name)
);

create index if not exists project_media_client_idx on public.project_media(client_id, created_at desc);
create index if not exists project_media_project_idx on public.project_media(project_intake_id, created_at desc);
drop trigger if exists project_media_updated_at on public.project_media;
create trigger project_media_updated_at before update on public.project_media for each row execute function public.set_updated_at();

alter table public.project_media enable row level security;
revoke all on public.project_media from authenticated;
grant select on public.project_media to authenticated;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'project_media_project_client_fk') then
    alter table public.project_media
      add constraint project_media_project_client_fk
      foreign key (project_intake_id, client_id)
      references public.project_intakes(id, client_id)
      on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'project_media_storage_path_format_check') then
    alter table public.project_media
      add constraint project_media_storage_path_format_check
      check (storage_path ~ ('^' || client_id::text || '/' || project_intake_id::text || '/[0-9a-fA-F-]{36}[.](jpg|png|webp|gif|pdf)$'));
  end if;
end $$;
drop policy if exists project_media_admin_all on public.project_media;
create policy project_media_admin_all on public.project_media for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists project_media_client_select on public.project_media;
create policy project_media_client_select on public.project_media for select to authenticated
  using (exists (
    select 1 from public.profiles profile
    join public.clients c on c.user_id = profile.id
    where profile.id = (select auth.uid())
      and profile.role = 'client'
      and c.id = client_id
  ));
drop policy if exists project_media_client_insert on public.project_media;
drop policy if exists project_media_client_delete on public.project_media;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('feaseweb-production-media', 'feaseweb-production-media', false, 10485760, array['image/jpeg','image/png','image/webp','image/gif','application/pdf']::text[])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists production_media_storage_select on storage.objects;
drop policy if exists production_media_storage_insert on storage.objects;
drop policy if exists production_media_storage_update on storage.objects;
drop policy if exists production_media_storage_delete on storage.objects;
drop policy if exists production_media_storage_admin_select on storage.objects;
drop policy if exists production_media_storage_admin_insert on storage.objects;
drop policy if exists production_media_storage_admin_update on storage.objects;
drop policy if exists production_media_storage_admin_delete on storage.objects;
create policy production_media_storage_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'feaseweb-production-media' and public.is_admin());
create policy production_media_storage_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'feaseweb-production-media' and public.is_admin());
create policy production_media_storage_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'feaseweb-production-media' and public.is_admin())
  with check (bucket_id = 'feaseweb-production-media' and public.is_admin());
create policy production_media_storage_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'feaseweb-production-media' and public.is_admin());
