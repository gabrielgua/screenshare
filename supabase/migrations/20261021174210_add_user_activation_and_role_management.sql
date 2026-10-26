alter table public.users add column is_active boolean not null default true;

create or replace function private.is_admin()
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
      and is_active
  );
$$;

create or replace function private.is_approved_user()
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
      and is_active
  );
$$;

create function private.ensure_caller_can_manage_user(target_user_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can manage users' using errcode = '42501';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'Admins cannot change their own account' using errcode = '22023';
  end if;
end;
$$;

revoke execute on function private.ensure_caller_can_manage_user(uuid) from public, anon, authenticated;

create function public.set_user_active(target_user_id uuid, should_be_active boolean)
returns public.users
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_user public.users;
begin
  perform private.ensure_caller_can_manage_user(target_user_id);

  update public.users
  set is_active = should_be_active
  where id = target_user_id
  returning * into updated_user;

  if updated_user.id is null then
    raise exception 'User not found' using errcode = 'P0002';
  end if;

  return updated_user;
end;
$$;

create function public.set_user_role(target_user_id uuid, new_role public.user_role)
returns public.users
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user public.users;
  updated_user public.users;
begin
  perform private.ensure_caller_can_manage_user(target_user_id);

  select * into target_user from public.users where id = target_user_id;

  if target_user.id is null then
    raise exception 'User not found' using errcode = 'P0002';
  end if;

  if new_role = 'admin' and (target_user.approval_status <> 'approved' or not target_user.is_active) then
    raise exception 'Only approved and active users can become admins' using errcode = '22023';
  end if;

  update public.users
  set role = new_role
  where id = target_user_id
  returning * into updated_user;

  return updated_user;
end;
$$;

revoke execute on function public.set_user_active(uuid, boolean) from public, anon;
revoke execute on function public.set_user_role(uuid, public.user_role) from public, anon;
grant execute on function public.set_user_active(uuid, boolean) to authenticated;
grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;
