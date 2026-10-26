create function private.send_room_kick(target_room_id uuid, kicked_user_id uuid, kick_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object('userId', kicked_user_id, 'reason', kick_reason),
    'room-member-kicked',
    'room-presence:' || target_room_id::text,
    true
  );
end;
$$;

revoke execute on function private.send_room_kick(uuid, uuid, text) from public, anon, authenticated;

create function public.kick_room_member(target_room_id uuid, target_user_id uuid)
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
    raise exception 'The room owner cannot be kicked' using errcode = '22023';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'You cannot kick yourself' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.room_members where room_id = target_room_id and user_id = target_user_id
  ) then
    raise exception 'This person is not a member of the room' using errcode = 'P0002';
  end if;

  perform private.send_room_kick(target_room_id, target_user_id, 'kicked');
end;
$$;

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

  perform private.send_room_kick(target_room_id, target_user_id, 'blocked');
end;
$$;

revoke execute on function public.kick_room_member(uuid, uuid) from public, anon;
grant execute on function public.kick_room_member(uuid, uuid) to authenticated;
