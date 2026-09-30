-- Fix the consume function's PL/pgSQL variable name collision with CURRENT_TIME.
-- The original migration is intentionally left unchanged.
begin;

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
  v_now timestamptz := clock_timestamp();
  next_expiry timestamptz;
  wait_seconds integer;
begin
  if p_category is null or char_length(p_category) not between 1 and 80
    or p_key_hash is null or p_key_hash !~ '^[0-9a-f]{64}$'
    or p_limit is null or p_limit < 1
    or p_window_seconds is null or p_window_seconds < 1 then
    raise exception 'invalid rate limit parameters' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_category || ':' || p_key_hash, 0));

  select * into current_bucket
  from public.rate_limit_buckets
  where category = p_category and key_hash = p_key_hash
  for update;

  if not found or current_bucket.expires_at <= v_now then
    next_expiry := v_now + make_interval(secs => p_window_seconds);
    insert into public.rate_limit_buckets as bucket
      (category, key_hash, request_count, window_started_at, expires_at, updated_at)
    values (p_category, p_key_hash, 1, v_now, next_expiry, v_now)
    on conflict (category, key_hash) do update
      set request_count = 1,
          window_started_at = excluded.window_started_at,
          expires_at = excluded.expires_at,
          updated_at = excluded.updated_at;
    return query select true, p_limit - 1, 0;
    return;
  end if;

  if current_bucket.request_count >= p_limit then
    wait_seconds := greatest(1, ceil(extract(epoch from (current_bucket.expires_at - v_now)))::integer);
    return query select false, 0, wait_seconds;
    return;
  end if;

  update public.rate_limit_buckets
  set request_count = request_count + 1, updated_at = v_now
  where category = p_category and key_hash = p_key_hash;

  return query select true, greatest(0, p_limit - current_bucket.request_count - 1), 0;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;

commit;
