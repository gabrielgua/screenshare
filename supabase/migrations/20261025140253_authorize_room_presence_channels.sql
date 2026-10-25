create function private.can_use_room_presence_topic(presence_topic text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  topic_room_id uuid;
begin
  if presence_topic is null
    or presence_topic !~ '^room-presence:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' then
    return false;
  end if;

  topic_room_id := substring(presence_topic from 15)::uuid;

  return private.is_approved_user()
    and (private.is_admin() or private.is_room_member(topic_room_id));
end;
$$;

revoke execute on function private.can_use_room_presence_topic(text) from public, anon;
grant execute on function private.can_use_room_presence_topic(text) to authenticated;

create policy "Room members and admins can watch room presence"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'presence'
  and (select private.can_use_room_presence_topic(realtime.topic()))
);

create policy "Room members and admins can share their room presence"
on realtime.messages
for insert
to authenticated
with check (
  realtime.messages.extension = 'presence'
  and (select private.can_use_room_presence_topic(realtime.topic()))
);
