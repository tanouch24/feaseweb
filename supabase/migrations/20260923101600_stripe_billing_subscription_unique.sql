-- FeaseWeb sells a single offer: one client can have at most one
-- subscription row. Enforcing this at the database level (not just in
-- application code) means a webhook race condition or a repeated
-- checkout attempt can never produce two subscription rows for the same
-- client — the webhook handler upserts on this constraint.
alter table public.subscriptions add constraint subscriptions_client_id_key unique (client_id);
