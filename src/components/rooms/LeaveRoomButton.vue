<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import ConfirmActionModal from '@/components/feedback/ConfirmActionModal.vue'
import { describeError } from '@/services/describe-error'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { useRoomStore } from '@/stores/room-store'
import { LeaveRoomIcon } from '@/theme/app-icons'

interface LeaveRoomButtonProps {
  roomName: string
}

defineOptions({ inheritAttrs: false })

const props = defineProps<LeaveRoomButtonProps>()

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
  <BaseButton
    v-bind="$attrs"
    variant="danger"
    appearance="outlined"
    :leading-icon="LeaveRoomIcon"
    @click="handleLeaveButtonClick"
  >
    Leave room
  </BaseButton>
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
</template>
