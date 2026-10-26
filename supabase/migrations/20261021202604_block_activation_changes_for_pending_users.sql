create or replace function public.set_user_active(target_user_id uuid, should_be_active boolean)
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

  if target_user.approval_status = 'pending' then
    raise exception 'Pending users must be approved or denied before they can be activated or deactivated' using errcode = '22023';
  end if;

  update public.users
  set is_active = should_be_active
  where id = target_user_id
  returning * into updated_user;

  return updated_user;
end;
$$;
