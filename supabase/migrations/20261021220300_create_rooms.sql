create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  owner_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rooms_owner_id_index on public.rooms (owner_id);

create table public.room_members (
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index room_members_user_id_index on public.room_members (user_id);

alter table public.rooms enable row level security;
alter table public.room_members enable row level security;

revoke all on table public.rooms, public.room_members from anon;
revoke insert, update, delete, truncate on table public.rooms, public.room_members from authenticated;
grant select on table public.rooms, public.room_members to authenticated;

create function private.is_room_member(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.room_members
    where room_id = target_room_id
      and user_id = auth.uid()
  );
$$;

revoke execute on function private.is_room_member(uuid) from public, anon;
grant execute on function private.is_room_member(uuid) to authenticated;

create policy "Approved members and admins can read rooms"
on public.rooms
for select
to authenticated
using (
  (select private.is_approved_user())
  and ((select private.is_admin()) or private.is_room_member(id))
);

create policy "Approved members and admins can read room memberships"
on public.room_members
for select
to authenticated
using (
  (select private.is_approved_user())
  and ((select private.is_admin()) or private.is_room_member(room_id))
);

create function private.ensure_caller_is_approved()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_approved_user() then
    raise exception 'Only approved users can use rooms' using errcode = '42501';
  end if;
end;
$$;

create function private.normalize_room_name(requested_name text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized_name text := btrim(coalesce(requested_name, ''));
begin
  if char_length(normalized_name) = 0 then
    raise exception 'A room needs a name' using errcode = '22023';
  end if;

  if char_length(normalized_name) > 60 then
    raise exception 'Room names can have at most 60 characters' using errcode = '22023';
  end if;

  return normalized_name;
end;
$$;

create function private.find_room_the_caller_can_manage(target_room_id uuid)
returns public.rooms
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  managed_room public.rooms;
begin
  perform private.ensure_caller_is_approved();

  select * into managed_room from public.rooms where id = target_room_id;

  if managed_room.id is null then
    raise exception 'Room not found' using errcode = 'P0002';
  end if;

  if managed_room.owner_id <> auth.uid() and not private.is_admin() then
    raise exception 'Only the room owner or an admin can manage this room' using errcode = '42501';
  end if;

  return managed_room;
end;
$$;

revoke execute on function private.ensure_caller_is_approved() from public, anon, authenticated;
revoke execute on function private.normalize_room_name(text) from public, anon, authenticated;
revoke execute on function private.find_room_the_caller_can_manage(uuid) from public, anon, authenticated;

create function public.create_room(room_name text)
returns public.rooms
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_room public.rooms;
begin
  perform private.ensure_caller_is_approved();

  if not private.is_admin() and exists (select 1 from public.rooms where owner_id = auth.uid()) then
    raise exception 'Members can only create one room' using errcode = '22023';
  end if;

  insert into public.rooms (name, owner_id)
  values (private.normalize_room_name(room_name), auth.uid())
  returning * into created_room;

  insert into public.room_members (room_id, user_id)
  values (created_room.id, auth.uid());

  return created_room;
end;
$$;

create function public.rename_room(target_room_id uuid, new_name text)
returns public.rooms
language plpgsql
security definer
set search_path = ''
as $$
declare
  renamed_room public.rooms;
begin
  perform private.find_room_the_caller_can_manage(target_room_id);

  update public.rooms
  set name = private.normalize_room_name(new_name), updated_at = now()
  where id = target_room_id
  returning * into renamed_room;

  return renamed_room;
end;
$$;

create function public.join_room(target_room_id uuid)
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

  insert into public.room_members (room_id, user_id)
  values (target_room_id, auth.uid())
  on conflict (room_id, user_id) do nothing;

  return joined_room;
end;
$$;

create function public.leave_room(target_room_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.ensure_caller_is_approved();

  if exists (select 1 from public.rooms where id = target_room_id and owner_id = auth.uid()) then
    raise exception 'Owners cannot leave their own room' using errcode = '22023';
  end if;

  delete from public.room_members where room_id = target_room_id and user_id = auth.uid();
end;
$$;

create function public.remove_room_member(target_room_id uuid, target_user_id uuid)
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
end;
$$;

create function public.get_room_preview(target_room_id uuid)
returns table (
  room_id uuid,
  room_name text,
  owner_name text,
  owner_avatar_url text,
  member_count bigint,
  is_member boolean
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
    private.is_room_member(room.id)
  from public.rooms as room
  join public.users as owner on owner.id = room.owner_id
  where room.id = target_room_id;
end;
$$;

create function public.list_room_members(target_room_id uuid)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  joined_at timestamptz,
  is_owner boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.ensure_caller_is_approved();

  if not private.is_admin() and not private.is_room_member(target_room_id) then
    raise exception 'Only room members can see who is in this room' using errcode = '42501';
  end if;

  return query
  select
    member.id,
    member.display_name,
    member.avatar_url,
    membership.joined_at,
    member.id = room.owner_id
  from public.room_members as membership
  join public.users as member on member.id = membership.user_id
  join public.rooms as room on room.id = membership.room_id
  where membership.room_id = target_room_id
  order by member.id = room.owner_id desc, membership.joined_at asc;
end;
$$;

create function public.list_my_rooms()
returns table (
  room_id uuid,
  room_name text,
  owner_id uuid,
  owner_name text,
  member_count bigint,
  is_owner boolean,
  created_at timestamptz
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
    room.owner_id,
    owner.display_name,
    (select count(*) from public.room_members as membership where membership.room_id = room.id),
    room.owner_id = auth.uid(),
    room.created_at
  from public.room_members as own_membership
  join public.rooms as room on room.id = own_membership.room_id
  join public.users as owner on owner.id = room.owner_id
  where own_membership.user_id = auth.uid()
  order by room.owner_id = auth.uid() desc, own_membership.joined_at desc;
end;
$$;

revoke execute on function public.create_room(text) from public, anon;
revoke execute on function public.rename_room(uuid, text) from public, anon;
revoke execute on function public.join_room(uuid) from public, anon;
revoke execute on function public.leave_room(uuid) from public, anon;
revoke execute on function public.remove_room_member(uuid, uuid) from public, anon;
revoke execute on function public.get_room_preview(uuid) from public, anon;
revoke execute on function public.list_room_members(uuid) from public, anon;
revoke execute on function public.list_my_rooms() from public, anon;

grant execute on function public.create_room(text) to authenticated;
grant execute on function public.rename_room(uuid, text) to authenticated;
grant execute on function public.join_room(uuid) to authenticated;
grant execute on function public.leave_room(uuid) to authenticated;
grant execute on function public.remove_room_member(uuid, uuid) to authenticated;
grant execute on function public.get_room_preview(uuid) to authenticated;
grant execute on function public.list_room_members(uuid) to authenticated;
grant execute on function public.list_my_rooms() to authenticated;
