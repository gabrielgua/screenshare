create function private.can_use_room_signaling_topic(signaling_topic text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  topic_room_id uuid;
begin
  if signaling_topic is null
    or signaling_topic !~ '^room-signaling:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then
    return false;
  end if;

  topic_room_id := substring(signaling_topic from 16)::uuid;

  return private.is_approved_user()
    and (private.is_admin() or private.is_room_member(topic_room_id));
end;
$$;

revoke execute on function private.can_use_room_signaling_topic(text) from public, anon;
grant execute on function private.can_use_room_signaling_topic(text) to authenticated;

create policy "Room members and admins can receive room signaling"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension in ('broadcast', 'presence')
  and (select private.can_use_room_signaling_topic(realtime.topic()))
);

create policy "Room members and admins can send room signaling"
on realtime.messages
for insert
to authenticated
with check (
  realtime.messages.extension = 'broadcast'
  and (select private.can_use_room_signaling_topic(realtime.topic()))
);
