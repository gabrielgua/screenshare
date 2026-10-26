<script setup lang="ts">
import StaggeredListTransition from '@/components/layout/StaggeredListTransition.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { PresentRoomUser } from '@/services/room-presence-service'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { useRoomStore } from '@/stores/room-store'
import RoomPresentUserRow from './RoomPresentUserRow.vue'
import RoomSectionHeading from './RoomSectionHeading.vue'

interface RoomPresentUsersListProps {
  presentUsers: PresentRoomUser[]
  roomOwnerId: string
}

const props = defineProps<RoomPresentUsersListProps>()

const currentUserStore = useCurrentUserStore()
const roomStore = useRoomStore()

function canKick(presentUser: PresentRoomUser): boolean {
  return (
    roomStore.canManageRoom &&
    presentUser.userId !== currentUserStore.currentUser?.id &&
    presentUser.userId !== props.roomOwnerId
  )
}
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col gap-2" aria-live="polite">
    <RoomSectionHeading title="Here now" :count="presentUsers.length" class="shrink-0" />
    <BaseText v-if="presentUsers.length === 0" size="sm" tone="subtle">
      Nobody is here right now.
    </BaseText>
    <StaggeredListTransition
      v-else
      tag="ul"
      class="scrollbar-thin-on-hover scrollbar-gutter-stable -mr-4 flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto pr-1.5"
    >
      <li
        v-for="(presentUser, listPosition) in presentUsers"
        :key="presentUser.userId"
        :data-stagger-index="listPosition"
      >
        <RoomPresentUserRow
          :present-user="presentUser"
          :is-current-user="presentUser.userId === currentUserStore.currentUser?.id"
          :is-room-owner="presentUser.userId === roomOwnerId"
          :can-be-kicked="canKick(presentUser)"
        />
      </li>
    </StaggeredListTransition>
  </section>
</template>
