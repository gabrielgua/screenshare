<script setup lang="ts">
import { onMounted } from 'vue'
import LoadErrorRetry from '@/components/feedback/LoadErrorRetry.vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import PageLoadingSpinner from '@/components/layout/PageLoadingSpinner.vue'
import PageTransition from '@/components/layout/PageTransition.vue'
import StaggeredListTransition from '@/components/layout/StaggeredListTransition.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useMyRoomsStore } from '@/stores/my-rooms-store'
import { RoomIcon } from '@/theme/app-icons'
import CreateRoomButton from './CreateRoomButton.vue'
import RoomSummaryCard from './RoomSummaryCard.vue'

const myRoomsStore = useMyRoomsStore()

onMounted(() => {
  myRoomsStore.loadMyRooms()
})

function handleRetryRequested() {
  myRoomsStore.loadMyRooms()
}
</script>

<template>
  <section class="flex w-full flex-col gap-4">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex flex-col gap-1">
        <BaseHeading :level="1" size="title">Your rooms</BaseHeading>
        <BaseText size="sm" tone="muted">
          Rooms you created or joined. Open one to share your screen.
        </BaseText>
      </div>
      <div class="flex flex-col items-stretch gap-1 sm:items-end">
        <CreateRoomButton />
        <BaseText v-if="!myRoomsStore.canCreateRoom" size="caption" tone="subtle">
          Members can own one room.
        </BaseText>
      </div>
    </header>

    <PageTransition>
      <PageLoadingSpinner
        v-if="myRoomsStore.isLoadingMyRooms && !myRoomsStore.hasLoadedMyRooms"
        accessible-label="Loading your rooms"
      />
      <LoadErrorRetry
        v-else-if="myRoomsStore.loadErrorMessage"
        :error-message="myRoomsStore.loadErrorMessage"
        @retry-requested="handleRetryRequested"
      />
      <BaseCard
        v-else-if="!myRoomsStore.hasRooms"
        class="flex flex-col items-center gap-3 py-10 text-center"
      >
        <BaseIconCircle :icon="RoomIcon" />
        <BaseText weight="semibold">You are not in any room yet</BaseText>
        <BaseText size="sm" tone="muted">
          Create a room, or open a room link a friend sent you.
        </BaseText>
      </BaseCard>
      <StaggeredListTransition v-else tag="ul" class="flex flex-col gap-3">
        <li
          v-for="(roomSummary, listPosition) in myRoomsStore.myRooms"
          :key="roomSummary.id"
          :data-stagger-index="listPosition"
        >
          <RoomSummaryCard :room-summary="roomSummary" />
        </li>
      </StaggeredListTransition>
    </PageTransition>
  </section>
</template>
