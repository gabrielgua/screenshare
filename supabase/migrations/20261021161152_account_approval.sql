create type public.user_role as enum ('member', 'admin');

create type public.user_approval_status as enum ('pending', 'approved', 'denied');

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  email text,
  role public.user_role not null default 'member',
  approval_status public.user_approval_status not null default 'pending',
  review_reason text check (char_length(review_reason) <= 500),
  reviewed_by uuid references public.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index users_approval_status_created_at_index on public.users (approval_status, created_at);

alter table public.users enable row level security;

revoke all on table public.users from anon;
revoke insert, update, delete, truncate on table public.users from authenticated;
grant select on table public.users to authenticated;

create function public.is_admin()
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

create function public.is_approved_user()
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

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_approved_user() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_approved_user() to authenticated;

create policy "Users can read their own user row"
on public.users
for select
to authenticated
using (id = (select auth.uid()));

create policy "Admins can read every user row"
on public.users
for select
to authenticated
using ((select public.is_admin()));

create function public.create_user_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, display_name, avatar_url, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data -> 'custom_claims' ->> 'global_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      'Discord user'
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.create_user_from_auth_user() from public, anon, authenticated;

create trigger create_user_after_sign_up
after insert on auth.users
for each row
execute function public.create_user_from_auth_user();

insert into public.users (id, display_name, avatar_url, email, created_at)
select
  auth_user.id,
  coalesce(
    auth_user.raw_user_meta_data -> 'custom_claims' ->> 'global_name',
    auth_user.raw_user_meta_data ->> 'full_name',
    auth_user.raw_user_meta_data ->> 'name',
    'Discord user'
  ),
  auth_user.raw_user_meta_data ->> 'avatar_url',
  auth_user.email,
  auth_user.created_at
from auth.users as auth_user
on conflict (id) do nothing;

create function public.review_user(
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
  if not public.is_admin() then
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

revoke execute on function public.review_user(uuid, public.user_approval_status, text) from public, anon;
grant execute on function public.review_user(uuid, public.user_approval_status, text) to authenticated;
