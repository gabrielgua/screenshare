<script setup lang="ts">
import StaggeredListTransition from '@/components/layout/StaggeredListTransition.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { PresentRoomUser } from '@/services/room-presence-service'
import { useCurrentUserStore } from '@/stores/current-user-store'
import RoomPresentUserRow from './RoomPresentUserRow.vue'
import RoomSectionHeading from './RoomSectionHeading.vue'

interface RoomPresentUsersListProps {
  presentUsers: PresentRoomUser[]
  roomOwnerId: string
}

defineProps<RoomPresentUsersListProps>()

const currentUserStore = useCurrentUserStore()
</script>

<template>
  <section class="flex flex-col gap-2" aria-live="polite">
    <RoomSectionHeading title="Here now" :count="presentUsers.length" />
    <BaseText v-if="presentUsers.length === 0" size="sm" tone="subtle">
      Nobody is here right now.
    </BaseText>
    <StaggeredListTransition v-else tag="ul" class="flex flex-col">
      <li
        v-for="(presentUser, listPosition) in presentUsers"
        :key="presentUser.userId"
        :data-stagger-index="listPosition"
      >
        <RoomPresentUserRow
          :present-user="presentUser"
          :is-current-user="presentUser.userId === currentUserStore.currentUser?.id"
          :is-room-owner="presentUser.userId === roomOwnerId"
        />
      </li>
    </StaggeredListTransition>
  </section>
</template>
