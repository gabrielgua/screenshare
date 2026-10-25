<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import ConfirmActionModal from '@/components/feedback/ConfirmActionModal.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { describeError } from '@/services/describe-error'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { useRoomStore } from '@/stores/room-store'
import { LeaveRoomIcon } from '@/theme/app-icons'
import RenameRoomButton from './RenameRoomButton.vue'
import ShareRoomLinkButton from './ShareRoomLinkButton.vue'

interface RoomHeaderProps {
  roomId: string
  roomName: string
  ownerName?: string
}

const props = withDefaults(defineProps<RoomHeaderProps>(), {
  ownerName: undefined,
})

const router = useRouter()
const roomStore = useRoomStore()
const actionFeedbackStore = useActionFeedbackStore()

const isLeaveModalOpen = ref(false)
const isLeavingRoom = ref(false)

function handleLeaveButtonClick() {
  isLeaveModalOpen.value = true
}

async function handleLeaveConfirmed() {
  isLeavingRoom.value = true
  try {
    await roomStore.leaveRequestedRoom()
    isLeaveModalOpen.value = false
    actionFeedbackStore.showSuccessFeedback(
      `You left ${props.roomName}`,
      'Open the room link again whenever you want to come back.',
    )
    router.push({ name: 'home' })
  } catch (leaveError) {
    actionFeedbackStore.showErrorFeedback(
      'Could not leave the room',
      describeError(leaveError, 'Something went wrong. Please try again.'),
    )
  } finally {
    isLeavingRoom.value = false
  }
}
</script>

<template>
  <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex min-w-0 flex-col gap-1">
      <BaseHeading :level="1" size="title" class="truncate">{{ roomName }}</BaseHeading>
      <BaseText v-if="ownerName" size="sm" tone="muted">
        {{ roomStore.isRoomOwner ? 'Your room' : `Created by ${ownerName}` }}
      </BaseText>
    </div>
    <div class="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
      <ShareRoomLinkButton :room-id="roomId" class="col-span-2 sm:col-span-1" />
      <RenameRoomButton
        v-if="roomStore.canManageRoom"
        :room-name="roomName"
        :class="{ 'col-span-2': !roomStore.isRoomMember || roomStore.isRoomOwner }"
      />
      <BaseButton
        v-if="roomStore.isRoomMember && !roomStore.isRoomOwner"
        variant="danger"
        appearance="outlined"
        :leading-icon="LeaveRoomIcon"
        :class="{ 'col-span-2': !roomStore.canManageRoom }"
        @click="handleLeaveButtonClick"
      >
        Leave room
      </BaseButton>
    </div>

    <ConfirmActionModal
      v-model:open="isLeaveModalOpen"
      :title="`Leave ${roomName}?`"
      description="It will disappear from your rooms. You can come back any time with the room link."
      confirm-label="Leave room"
      :icon="LeaveRoomIcon"
      variant="danger"
      :is-submitting="isLeavingRoom"
      @confirmed="handleLeaveConfirmed"
    />
  </header>
</template>
