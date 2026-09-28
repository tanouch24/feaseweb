-- Persistent idempotency and delivery state for client update email notifications.
-- This migration is intentionally local-only until explicitly approved.
alter table public.client_updates
  add column if not exists idempotency_key uuid,
  add column if not exists notification_status text not null default 'pending',
  add column if not exists notification_sent_at timestamptz,
  add column if not exists notification_error text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'client_updates_notification_status_check') then
    alter table public.client_updates
      add constraint client_updates_notification_status_check
      check (notification_status in ('pending', 'sending', 'sent', 'failed'));
  end if;
end $$;

create unique index if not exists client_updates_admin_idempotency_idx
  on public.client_updates(created_by, client_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists client_updates_notification_status_idx
  on public.client_updates(id, notification_status);
