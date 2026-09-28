-- FeaseWeb V9: mandatory validation call before subscription checkout.

create table public.project_appointments (
  id uuid primary key default gen_random_uuid(),
  project_intake_id uuid not null unique references public.project_intakes(id) on delete cascade,
  appointment_status text not null default 'not_scheduled'
    check (appointment_status in ('not_scheduled', 'scheduled', 'completed', 'cancelled')),
  appointment_date date,
  appointment_time time,
  phone text check (phone is null or char_length(phone) between 7 and 40),
  note text check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    appointment_status <> 'scheduled'
    or (appointment_date is not null and appointment_time is not null and phone is not null)
  )
);

create index project_appointments_status_idx on public.project_appointments(appointment_status, appointment_date, appointment_time);
create trigger project_appointments_updated_at before update on public.project_appointments
  for each row execute function public.set_updated_at();

alter table public.project_appointments enable row level security;
revoke all on public.project_appointments from anon, authenticated;
grant select on public.project_appointments to authenticated;
grant all on public.project_appointments to service_role;

create policy project_appointments_admin_all on public.project_appointments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy project_appointments_prospect_select on public.project_appointments for select to authenticated
  using (exists (
    select 1
    from public.project_intakes intake
    join public.profiles profile on profile.id = (select auth.uid())
    where intake.id = project_intake_id
      and intake.user_id = (select auth.uid())
      and profile.role = 'prospect'
  ));

create table public.project_validations (
  id uuid primary key default gen_random_uuid(),
  project_intake_id uuid not null unique references public.project_intakes(id) on delete cascade,
  validation_status text not null default 'pending'
    check (validation_status in ('pending', 'approved', 'needs_information', 'declined')),
  decided_at timestamptz,
  decided_by uuid references auth.users(id) on delete set null,
  internal_note text check (internal_note is null or char_length(internal_note) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_validations_status_idx on public.project_validations(validation_status, updated_at desc);
create trigger project_validations_updated_at before update on public.project_validations
  for each row execute function public.set_updated_at();

alter table public.project_validations enable row level security;
revoke all on public.project_validations from anon, authenticated;
grant select on public.project_validations to authenticated;
grant all on public.project_validations to service_role;

create policy project_validations_admin_all on public.project_validations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
