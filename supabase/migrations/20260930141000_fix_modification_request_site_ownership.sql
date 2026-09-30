-- Correct the modification request site-ownership policy.
-- The previous policy used an unqualified client_id inside the site
-- subquery, which PostgreSQL resolved as a self-comparison.
begin;

drop policy if exists requests_self_insert on public.modification_requests;

create policy requests_self_insert on public.modification_requests
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.clients as c
      where c.id = public.modification_requests.client_id
        and c.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.sites as s
      where s.id = public.modification_requests.site_id
        and s.client_id = public.modification_requests.client_id
    )
  );

commit;
