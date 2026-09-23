-- FeaseWeb V5: Stripe Billing. Additive only — does not modify
-- 20260922140000_backoffice_v4.sql. Reuses the existing provider-agnostic
-- external_customer_id / external_subscription_id / external_reference
-- columns already present on subscriptions/payments rather than duplicating
-- Stripe-specific ID columns.

-- Extend the subscription status vocabulary to cover every Stripe
-- subscription status, using the same French business-status convention
-- already used elsewhere in the schema.
alter type public.subscription_status add value if not exists 'essai';              -- trialing
alter type public.subscription_status add value if not exists 'incomplet_expire';   -- incomplete_expired
alter type public.subscription_status add value if not exists 'en_pause';           -- paused

-- Fields needed to sync a real Stripe subscription. next_billing_at (already
-- present) is reused for the subscription item's current_period_end — in
-- this Stripe API version, current_period_start/end live on the
-- subscription item, not the subscription object itself.
alter table public.subscriptions
  add column if not exists external_price_id text,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists canceled_at timestamptz;

-- Same provider allow-list as subscriptions already has, for consistency.
alter table public.payments
  add constraint payments_provider_check check (provider in ('none', 'stripe'));

-- Let a payment/invoice row point at the subscription it belongs to,
-- without duplicating subscription data onto payments.
alter table public.payments
  add column if not exists subscription_id uuid references public.subscriptions(id) on delete set null;

create index if not exists payments_subscription_idx on public.payments(subscription_id);

-- Webhook idempotency ledger. Stripe can and will redeliver events; a
-- unique constraint on stripe_event_id is what makes "process this event"
-- safe to run twice. No RLS policies are created on purpose: this table is
-- written only by the webhook route using the service-role/secret client,
-- which bypasses RLS by design. No authenticated or anon role should ever
-- read or write it directly.
create table public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;
revoke all on public.stripe_webhook_events from anon, authenticated;
