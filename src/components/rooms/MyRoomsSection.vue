<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import LoadErrorRetry from '@/components/feedback/LoadErrorRetry.vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import PageLoadingSpinner from '@/components/layout/PageLoadingSpinner.vue'
import PageTransition from '@/components/layout/PageTransition.vue'
import StaggeredListTransition from '@/components/layout/StaggeredListTransition.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { describeError } from '@/services/describe-error'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { useMyRoomsStore } from '@/stores/my-rooms-store'
import { AddIcon, RoomIcon } from '@/theme/app-icons'
import RoomNameDialog from './RoomNameDialog.vue'
import RoomSummaryCard from './RoomSummaryCard.vue'

const router = useRouter()
const myRoomsStore = useMyRoomsStore()
const actionFeedbackStore = useActionFeedbackStore()

const isCreateRoomDialogOpen = ref(false)
const isCreatingRoom = ref(false)

onMounted(() => {
  myRoomsStore.loadMyRooms()
})

function handleCreateRoomButtonClick() {
  isCreateRoomDialogOpen.value = true
}

async function handleRoomNameSubmitted(roomName: string) {
  isCreatingRoom.value = true
  try {
    const createdRoom = await myRoomsStore.createNewRoom(roomName)
    isCreateRoomDialogOpen.value = false
    actionFeedbackStore.showSuccessFeedback(
      `${createdRoom.name} is ready`,
      'Share its link so your friends can join.',
    )
    router.push({ name: 'room', params: { roomId: createdRoom.id } })
  } catch (createError) {
    actionFeedbackStore.showErrorFeedback(
      'Could not create the room',
      describeError(createError, 'Something went wrong. Please try again.'),
    )
  } finally {
    isCreatingRoom.value = false
  }
}

function handleRetryRequested() {
  myRoomsStore.loadMyRooms()
}
</script>

<template>
  <section class="flex w-full flex-col gap-4">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex flex-col gap-1">
        <BaseHeading :level="2" size="subtitle">Your rooms</BaseHeading>
        <BaseText size="sm" tone="muted">
          Rooms you created or joined. Open one to share your screen.
        </BaseText>
      </div>
      <div class="flex flex-col items-stretch gap-1 sm:items-end">
        <BaseButton
          :leading-icon="AddIcon"
          :is-disabled="!myRoomsStore.canCreateRoom"
          @click="handleCreateRoomButtonClick"
        >
          Create room
        </BaseButton>
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

    <RoomNameDialog
      v-model:open="isCreateRoomDialogOpen"
      title="Create a room"
      confirm-label="Create room"
      :confirm-icon="AddIcon"
      :is-submitting="isCreatingRoom"
      @room-name-submitted="handleRoomNameSubmitted"
    />
  </section>
</template>
