<script setup lang="ts">
import type { PresentRoomUser } from '@/services/room-presence-service'
import type { Room } from '@/services/rooms-service'
import { useRoomStore } from '@/stores/room-store'
import LeaveRoomButton from './LeaveRoomButton.vue'
import RenameRoomButton from './RenameRoomButton.vue'
import RoomMembersButton from './RoomMembersButton.vue'
import RoomPresentUsersList from './RoomPresentUsersList.vue'
import ShareRoomLinkButton from './ShareRoomLinkButton.vue'

interface RoomDetailsPanelProps {
  room: Room
  presentUsers: PresentRoomUser[]
  presentUserIds: string[]
  hasMembersButton?: boolean
}

withDefaults(defineProps<RoomDetailsPanelProps>(), {
  hasMembersButton: true,
})

const roomStore = useRoomStore()
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
    <div class="flex flex-col gap-2 pb-4">
      <ShareRoomLinkButton :room-id="room.id" is-full-width />
      <div
        v-if="hasMembersButton || roomStore.canManageRoom"
        class="grid gap-2"
        :class="hasMembersButton && roomStore.canManageRoom ? 'grid-cols-2' : 'grid-cols-1'"
      >
        <RoomMembersButton
          v-if="hasMembersButton"
          :room-name="room.name"
          :present-user-ids="presentUserIds"
        />
        <RenameRoomButton v-if="roomStore.canManageRoom" :room-name="room.name" />
      </div>
    </div>
    <div class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto py-4 last:pb-0">
      <RoomPresentUsersList :present-users="presentUsers" :room-owner-id="room.ownerId" />
    </div>
    <div v-if="roomStore.isRoomMember && !roomStore.isRoomOwner" class="pt-4">
      <LeaveRoomButton :room-name="room.name" is-full-width />
    </div>
  </div>
</template>
