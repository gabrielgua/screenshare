create table public.room_blocked_users (
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  blocked_by uuid references public.users (id) on delete set null,
  blocked_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index room_blocked_users_user_id_index on public.room_blocked_users (user_id);
create index room_blocked_users_blocked_by_index on public.room_blocked_users (blocked_by);

alter table public.room_blocked_users enable row level security;

revoke all on table public.room_blocked_users from anon;
revoke insert, update, delete, truncate on table public.room_blocked_users from authenticated;
grant select on table public.room_blocked_users to authenticated;

create policy "Room owners and admins can read blocked users"
on public.room_blocked_users
for select
to authenticated
using (
  (select private.is_approved_user())
  and (
    (select private.is_admin())
    or exists (
      select 1
      from public.rooms as room
      where room.id = room_blocked_users.room_id
        and room.owner_id = (select auth.uid())
    )
  )
);

create function private.is_blocked_from_room(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.room_blocked_users
    where room_id = target_room_id
      and user_id = auth.uid()
  );
$$;

revoke execute on function private.is_blocked_from_room(uuid) from public, anon, authenticated;

create or replace function public.remove_room_member(target_room_id uuid, target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  managed_room public.rooms;
begin
  managed_room := private.find_room_the_caller_can_manage(target_room_id);

  if target_user_id = managed_room.owner_id then
    raise exception 'The room owner cannot be removed' using errcode = '22023';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'Use leave room to remove yourself' using errcode = '22023';
  end if;

  delete from public.room_members where room_id = target_room_id and user_id = target_user_id;

  insert into public.room_blocked_users (room_id, user_id, blocked_by)
  values (target_room_id, target_user_id, auth.uid())
  on conflict (room_id, user_id) do nothing;
end;
$$;

create or replace function public.join_room(target_room_id uuid)
returns public.rooms
language plpgsql
security definer
set search_path = ''
as $$
declare
  joined_room public.rooms;
begin
  perform private.ensure_caller_is_approved();

  select * into joined_room from public.rooms where id = target_room_id;

  if joined_room.id is null then
    raise exception 'Room not found' using errcode = 'P0002';
  end if;

  if private.is_blocked_from_room(target_room_id) then
    raise exception 'You were removed from this room and cannot join it again' using errcode = '42501';
  end if;

  insert into public.room_members (room_id, user_id)
  values (target_room_id, auth.uid())
  on conflict (room_id, user_id) do nothing;

  return joined_room;
end;
$$;

drop function public.get_room_preview(uuid);

create function public.get_room_preview(target_room_id uuid)
returns table (
  room_id uuid,
  room_name text,
  owner_name text,
  owner_avatar_url text,
  member_count bigint,
  is_member boolean,
  is_blocked boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.ensure_caller_is_approved();

  return query
  select
    room.id,
    room.name,
    owner.display_name,
    owner.avatar_url,
    (select count(*) from public.room_members as membership where membership.room_id = room.id),
    private.is_room_member(room.id),
    private.is_blocked_from_room(room.id)
  from public.rooms as room
  join public.users as owner on owner.id = room.owner_id
  where room.id = target_room_id;
end;
$$;

create function public.list_blocked_room_users(target_room_id uuid)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  blocked_at timestamptz,
  blocked_by_name text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.find_room_the_caller_can_manage(target_room_id);

  return query
  select
    blocked_user.id,
    blocked_user.display_name,
    blocked_user.avatar_url,
    block.blocked_at,
    blocker.display_name
  from public.room_blocked_users as block
  join public.users as blocked_user on blocked_user.id = block.user_id
  left join public.users as blocker on blocker.id = block.blocked_by
  where block.room_id = target_room_id
  order by block.blocked_at desc;
end;
$$;

create function public.unblock_room_user(target_room_id uuid, target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.find_room_the_caller_can_manage(target_room_id);

  delete from public.room_blocked_users
  where room_id = target_room_id
    and user_id = target_user_id;
end;
$$;

create function public.list_all_rooms()
returns table (
  room_id uuid,
  room_name text,
  owner_id uuid,
  owner_name text,
  owner_avatar_url text,
  member_count bigint,
  blocked_user_count bigint,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can list every room' using errcode = '42501';
  end if;

  return query
  select
    room.id,
    room.name,
    room.owner_id,
    owner.display_name,
    owner.avatar_url,
    (select count(*) from public.room_members as membership where membership.room_id = room.id),
    (select count(*) from public.room_blocked_users as block where block.room_id = room.id),
    room.created_at,
    room.updated_at
  from public.rooms as room
  join public.users as owner on owner.id = room.owner_id
  order by room.created_at desc;
end;
$$;

revoke execute on function public.get_room_preview(uuid) from public, anon;
revoke execute on function public.list_blocked_room_users(uuid) from public, anon;
revoke execute on function public.unblock_room_user(uuid, uuid) from public, anon;
revoke execute on function public.list_all_rooms() from public, anon;

grant execute on function public.get_room_preview(uuid) to authenticated;
grant execute on function public.list_blocked_room_users(uuid) to authenticated;
grant execute on function public.unblock_room_user(uuid, uuid) to authenticated;
grant execute on function public.list_all_rooms() to authenticated;
