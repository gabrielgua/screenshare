create schema if not exists private;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
      and approval_status = 'approved'
  );
$$;

create function private.is_approved_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and approval_status = 'approved'
  );
$$;

revoke execute on function private.is_admin() from public, anon;
revoke execute on function private.is_approved_user() from public, anon;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_approved_user() to authenticated;

drop policy "Users can read their own user row" on public.users;
drop policy "Admins can read every user row" on public.users;

create policy "Users can read their own row and admins can read every row"
on public.users
for select
to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));

create or replace function public.review_user(
  target_user_id uuid,
  decision public.user_approval_status,
  reason text default null
)
returns public.users
language plpgsql
security definer
set search_path = ''
as $$
declare
  reviewed_user public.users;
begin
  if not private.is_admin() then
    raise exception 'Only admins can review users' using errcode = '42501';
  end if;

  if decision = 'pending' then
    raise exception 'A review must approve or deny the user' using errcode = '22023';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'Admins cannot review their own account' using errcode = '22023';
  end if;

  update public.users
  set
    approval_status = decision,
    review_reason = nullif(btrim(reason), ''),
    reviewed_by = auth.uid(),
    reviewed_at = now()
  where id = target_user_id
  returning * into reviewed_user;

  if reviewed_user.id is null then
    raise exception 'User not found' using errcode = 'P0002';
  end if;

  return reviewed_user;
end;
$$;

drop function public.is_admin();
drop function public.is_approved_user();
