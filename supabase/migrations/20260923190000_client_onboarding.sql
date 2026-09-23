-- FeaseWeb V8: client invitation and account recovery state.

alter table public.clients
  add column if not exists access_status text not null default 'non_invite',
  add column if not exists invited_at timestamptz,
  add column if not exists activated_at timestamptz;

alter table public.clients
  add constraint clients_access_status_check
  check (access_status in ('non_invite', 'invitation_envoyee', 'actif'));

-- An existing deterministic auth association means the client account is already active.
update public.clients
set access_status = 'actif', activated_at = coalesce(activated_at, updated_at)
where user_id is not null and access_status = 'non_invite';

create index if not exists clients_access_status_idx on public.clients(access_status);
