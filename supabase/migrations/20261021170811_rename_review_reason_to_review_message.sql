alter table public.users rename column review_reason to review_message;

drop function public.review_user(uuid, public.user_approval_status, text);

create function public.review_user(
  target_user_id uuid,
  decision public.user_approval_status,
  message text default null
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
    review_message = nullif(btrim(message), ''),
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

revoke execute on function public.review_user(uuid, public.user_approval_status, text) from public, anon;
grant execute on function public.review_user(uuid, public.user_approval_status, text) to authenticated;
