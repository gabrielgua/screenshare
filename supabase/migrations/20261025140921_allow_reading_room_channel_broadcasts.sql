drop policy "Room members and admins can watch room presence" on realtime.messages;

create policy "Room members and admins can watch room presence"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension in ('presence', 'broadcast')
  and (select private.can_use_room_presence_topic(realtime.topic()))
);
