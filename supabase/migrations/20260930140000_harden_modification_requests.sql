-- Harden modification_requests ownership and client write permissions.
-- Apply remotely only after a separate production review.
begin;

-- Clients only need to create a request and read their own requests.
-- Admins continue to use the existing admin policy for status handling.
revoke insert, update, delete on public.modification_requests from authenticated;

grant insert (client_id, site_id, title, category, message, priority)
  on public.modification_requests to authenticated;

grant update (status, internal_reply, resolved_at)
  on public.modification_requests to authenticated;

drop policy if exists requests_self_insert on public.modification_requests;
create policy requests_self_insert on public.modification_requests
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.clients c
      where c.id = client_id
        and c.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.sites s
      where s.id = site_id
        and s.client_id = client_id
    )
  );

drop policy if exists requests_self_update on public.modification_requests;

commit;
