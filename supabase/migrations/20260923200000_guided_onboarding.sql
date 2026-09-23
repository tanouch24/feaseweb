-- FeaseWeb V8.1: public account onboarding and project configuration.

alter type public.app_role add value if not exists 'prospect';
alter table public.profiles alter column role set default 'prospect';

create table public.project_intakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text not null check (char_length(first_name) between 1 and 100),
  last_name text not null check (char_length(last_name) between 1 and 100),
  company text not null check (char_length(company) between 1 and 180),
  email text not null check (char_length(email) <= 320),
  phone text check (phone is null or char_length(phone) <= 40),
  activity text check (activity in ('artisan_btp','commerce','restaurant','beaute','sante','immobilier','automobile','services_entreprises','profession_liberale','autre')),
  has_existing_site boolean not null default false,
  existing_site_url text check (existing_site_url is null or char_length(existing_site_url) <= 2048),
  existing_site_project text check (existing_site_project in ('refonte_complete','modernisation','conseil')),
  primary_objective text check (primary_objective in ('devis','appels','presentation','rendez_vous','vente','visite')),
  requested_pages text[] not null default array['accueil','contact']::text[],
  style_direction text check (style_direction in ('elegant_premium','moderne_epure','artisan_rassurant','dynamique_commercial','sobre_professionnel','chaleureux_humain')),
  color_mood text check (color_mood in ('clair_minimal','noir_premium','bleu_professionnel','vert_naturel','tons_chauds','laisser_feaseweb')),
  available_assets text[] not null default '{}'::text[],
  contact_channel text check (contact_channel in ('telephone','whatsapp','email')),
  contact_slot text check (contact_slot in ('matin','apres_midi','fin_journee')),
  current_step smallint not null default 1 check (current_step between 1 and 8),
  project_status text not null default 'project_configured' check (project_status in ('project_configured','subscription_active','preparation','building','preview_ready','client_feedback','finalizing','live')),
  completed_at timestamptz,
  support_message text check (support_message is null or char_length(support_message) <= 2000),
  support_requested_at timestamptz,
  prospect_id uuid unique references public.prospects(id) on delete set null,
  client_id uuid unique references public.clients(id) on delete set null
);

create index project_intakes_status_idx on public.project_intakes(project_status, updated_at desc);
create index project_intakes_client_idx on public.project_intakes(client_id);
create trigger project_intakes_updated_at before update on public.project_intakes for each row execute function public.set_updated_at();

alter table public.project_intakes enable row level security;
grant select, insert, update on public.project_intakes to authenticated;

create policy project_intakes_admin_all on public.project_intakes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy project_intakes_self_select on public.project_intakes for select to authenticated
  using (user_id = (select auth.uid()));
create policy project_intakes_self_insert on public.project_intakes for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy project_intakes_self_update on public.project_intakes for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- The prospect can edit only questionnaire/contact fields. Role, project status,
-- user association and client association remain server/service-role fields.
revoke insert, update on public.project_intakes from authenticated;
grant insert (user_id, first_name, last_name, company, email, phone, activity, has_existing_site, existing_site_url, existing_site_project, primary_objective, requested_pages, style_direction, color_mood, available_assets, contact_channel, contact_slot, current_step, support_message, support_requested_at) on public.project_intakes to authenticated;
grant update (first_name, last_name, company, email, phone, activity, has_existing_site, existing_site_url, existing_site_project, primary_objective, requested_pages, style_direction, color_mood, available_assets, contact_channel, contact_slot, current_step, support_message, support_requested_at, updated_at) on public.project_intakes to authenticated;

create table public.project_access_requirements (
  id uuid primary key default gen_random_uuid(),
  project_intake_id uuid not null references public.project_intakes(id) on delete cascade,
  category text not null check (category in ('cms','hebergement','domaine','dns','ftp_sftp')),
  status text not null default 'non_necessaire' check (status in ('non_necessaire','a_fournir','aide_demandee','recu','valide')),
  client_choice text check (client_choice in ('connait_acces','partiel','ne_sait_pas','agence')),
  client_note text check (client_note is null or char_length(client_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_intake_id, category)
);
create index project_access_requirements_project_idx on public.project_access_requirements(project_intake_id);
create trigger project_access_requirements_updated_at before update on public.project_access_requirements for each row execute function public.set_updated_at();
alter table public.project_access_requirements enable row level security;
grant select, insert, update on public.project_access_requirements to authenticated;
create policy project_access_admin_all on public.project_access_requirements for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy project_access_client_select on public.project_access_requirements for select to authenticated using (exists (select 1 from public.project_intakes p where p.id = project_intake_id and p.user_id = (select auth.uid())));
create policy project_access_client_insert on public.project_access_requirements for insert to authenticated with check (exists (select 1 from public.project_intakes p where p.id = project_intake_id and p.user_id = (select auth.uid())));
revoke update on public.project_access_requirements from authenticated;
revoke insert on public.project_access_requirements from authenticated;
grant insert (project_intake_id, category, client_choice, client_note) on public.project_access_requirements to authenticated;
grant update (client_choice, client_note) on public.project_access_requirements to authenticated;
