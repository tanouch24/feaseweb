-- Add the minimum fields needed for controlled client updates and read state.
-- Existing category/status/visibility columns remain compatible with old rows.
alter table public.client_updates
  add column if not exists update_type text not null default 'information',
  add column if not exists action_type text,
  add column if not exists read_at timestamptz;

alter table public.client_updates
  add constraint client_updates_update_type_check
    check (update_type in ('information', 'avancement', 'action_requise', 'apercu_disponible', 'mise_en_ligne')),
  add constraint client_updates_action_type_check
    check (action_type is null or action_type in ('voir_apercu', 'completer_informations', 'voir_projet'));

create index if not exists client_updates_unread_idx
  on public.client_updates(client_id, visible_to_client, read_at)
  where visible_to_client = true and read_at is null;
