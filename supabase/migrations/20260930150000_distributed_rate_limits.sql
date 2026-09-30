-- Distributed application rate limiting.
-- Keys are HMAC-pseudonymised by the server before reaching this table.
begin;

create table if not exists public.rate_limit_buckets (
  category text not null,
  key_hash text not null,
  request_count integer not null default 0,
  window_started_at timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (category, key_hash),
  constraint rate_limit_buckets_category_check check (char_length(category) between 1 and 80),
  constraint rate_limit_buckets_key_hash_check check (key_hash ~ '^[0-9a-f]{64}$'),
  constraint rate_limit_buckets_count_check check (request_count >= 0)
);

create index if not exists rate_limit_buckets_expires_idx
  on public.rate_limit_buckets (expires_at);

alter table public.rate_limit_buckets enable row level security;
revoke all on table public.rate_limit_buckets from anon, authenticated;
grant all on table public.rate_limit_buckets to service_role;

create or replace function public.consume_rate_limit(
  p_category text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, retry_after integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_bucket public.rate_limit_buckets%rowtype;
  current_time timestamptz := clock_timestamp();
  next_expiry timestamptz;
  wait_seconds integer;
begin
  if p_category is null or char_length(p_category) not between 1 and 80
    or p_key_hash is null or p_key_hash !~ '^[0-9a-f]{64}$'
    or p_limit is null or p_limit < 1
    or p_window_seconds is null or p_window_seconds < 1 then
    raise exception 'invalid rate limit parameters' using errcode = '22023';
  end if;

  -- Serialize callers for the same logical bucket. This makes the
  -- read/check/increment sequence atomic across application instances.
  perform pg_advisory_xact_lock(hashtextextended(p_category || ':' || p_key_hash, 0));

  select * into current_bucket
  from public.rate_limit_buckets
  where category = p_category and key_hash = p_key_hash
  for update;

  if not found or current_bucket.expires_at <= current_time then
    next_expiry := current_time + make_interval(secs => p_window_seconds);
    insert into public.rate_limit_buckets as bucket
      (category, key_hash, request_count, window_started_at, expires_at, updated_at)
    values (p_category, p_key_hash, 1, current_time, next_expiry, current_time)
    on conflict (category, key_hash) do update
      set request_count = 1,
          window_started_at = excluded.window_started_at,
          expires_at = excluded.expires_at,
          updated_at = excluded.updated_at;
    return query select true, p_limit - 1, 0;
    return;
  end if;

  if current_bucket.request_count >= p_limit then
    wait_seconds := greatest(1, ceil(extract(epoch from (current_bucket.expires_at - current_time)))::integer);
    return query select false, 0, wait_seconds;
    return;
  end if;

  update public.rate_limit_buckets
  set request_count = request_count + 1, updated_at = current_time
  where category = p_category and key_hash = p_key_hash;

  return query select true, greatest(0, p_limit - current_bucket.request_count - 1), 0;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;

create or replace function public.purge_expired_rate_limit_buckets(p_batch_size integer default 1000)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  deleted_count integer;
begin
  if p_batch_size is null or p_batch_size < 1 or p_batch_size > 10000 then
    raise exception 'invalid cleanup batch size' using errcode = '22023';
  end if;

  with expired as (
    select category, key_hash
    from public.rate_limit_buckets
    where expires_at <= clock_timestamp()
    order by expires_at
    limit p_batch_size
  )
  delete from public.rate_limit_buckets bucket
  using expired
  where bucket.category = expired.category and bucket.key_hash = expired.key_hash;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.purge_expired_rate_limit_buckets(integer) from public, anon, authenticated;
grant execute on function public.purge_expired_rate_limit_buckets(integer) to service_role;

commit;
