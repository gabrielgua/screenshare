<script setup lang="ts">
import { computed } from 'vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import StaggeredListTransition from '@/components/layout/StaggeredListTransition.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useRoomsPresence } from '@/composables/use-rooms-presence'
import type { PresentRoomUser } from '@/services/room-presence-service'
import type { RoomSummary } from '@/services/rooms-service'
import { useMyRoomsStore } from '@/stores/my-rooms-store'
import { RoomIcon } from '@/theme/app-icons'
import LiveRoomCard from './LiveRoomCard.vue'

interface LiveRoom {
  roomSummary: RoomSummary
  presentUsers: PresentRoomUser[]
}

const myRoomsStore = useMyRoomsStore()

const roomIds = computed(() => myRoomsStore.myRooms.map((roomSummary) => roomSummary.id))
const { readPresentUsers } = useRoomsPresence(roomIds)

function countSharers(liveRoom: LiveRoom): number {
  return liveRoom.presentUsers.filter((presentUser) => presentUser.isSharingScreen).length
}

const liveRooms = computed<LiveRoom[]>(() =>
  myRoomsStore.myRooms
    .map((roomSummary) => ({ roomSummary, presentUsers: readPresentUsers(roomSummary.id) }))
    .filter((liveRoom) => liveRoom.presentUsers.length > 0)
    .sort(
      (firstRoom, secondRoom) =>
        countSharers(secondRoom) - countSharers(firstRoom) ||
        secondRoom.presentUsers.length - firstRoom.presentUsers.length,
    ),
)
const hasLiveRooms = computed(() => liveRooms.value.length > 0)
</script>

<template>
  <section class="flex flex-col gap-4" aria-live="polite">
    <div class="flex items-center gap-2">
      <span class="relative flex size-2.5 shrink-0" aria-hidden="true">
        <span
          v-if="hasLiveRooms"
          class="absolute inline-flex size-full animate-ping rounded-full bg-success-400 opacity-75 motion-reduce:animate-none"
        />
        <span
          class="relative inline-flex size-2.5 rounded-full"
          :class="hasLiveRooms ? 'bg-success-500' : 'bg-neutral-300 dark:bg-neutral-600'"
        />
      </span>
      <BaseHeading :level="2" size="subtitle">Live now</BaseHeading>
      <BaseText v-if="hasLiveRooms" as="span" size="sm" tone="subtle">
        {{ liveRooms.length }}
      </BaseText>
    </div>
    <StaggeredListTransition v-if="hasLiveRooms" tag="ul" class="grid gap-3 md:grid-cols-2">
      <li
        v-for="(liveRoom, listPosition) in liveRooms"
        :key="liveRoom.roomSummary.id"
        :data-stagger-index="listPosition"
        class="min-w-0"
      >
        <LiveRoomCard :room-summary="liveRoom.roomSummary" :present-users="liveRoom.presentUsers" />
      </li>
    </StaggeredListTransition>
    <BaseCard v-else padding="compact" class="flex items-center gap-4">
      <BaseIconCircle :icon="RoomIcon" variant="neutral" size="sm" />
      <div class="flex min-w-0 flex-col">
        <BaseText weight="semibold">Nobody is live right now</BaseText>
        <BaseText size="sm" tone="muted">
          Your rooms show up here as soon as someone joins one.
        </BaseText>
      </div>
    </BaseCard>
  </section>
</template>
