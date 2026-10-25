<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import ConfirmActionModal from '@/components/feedback/ConfirmActionModal.vue'
import { describeError } from '@/services/describe-error'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { useRoomStore } from '@/stores/room-store'
import { LeaveRoomIcon } from '@/theme/app-icons'

interface QuitRoomButtonProps {
  roomName: string
}

defineOptions({ inheritAttrs: false })

const props = defineProps<QuitRoomButtonProps>()

const router = useRouter()
const roomStore = useRoomStore()
const actionFeedbackStore = useActionFeedbackStore()

const isQuitModalOpen = ref(false)
const isQuittingRoom = ref(false)

function handleQuitButtonClick() {
  isQuitModalOpen.value = true
}

async function handleQuitConfirmed() {
  isQuittingRoom.value = true
  try {
    await roomStore.leaveRequestedRoom()
    isQuitModalOpen.value = false
    actionFeedbackStore.showSuccessFeedback(
      `You quit ${props.roomName}`,
      'It is no longer in your rooms. Open the room link again to join it.',
    )
    router.push({ name: 'home' })
  } catch (quitError) {
    actionFeedbackStore.showErrorFeedback(
      'Could not quit the room',
      describeError(quitError, 'Something went wrong. Please try again.'),
    )
  } finally {
    isQuittingRoom.value = false
  }
}
</script>

<template>
  <BaseButton
    v-bind="$attrs"
    variant="danger"
    appearance="outlined"
    :leading-icon="LeaveRoomIcon"
    @click="handleQuitButtonClick"
  >
    Quit room
  </BaseButton>
  <ConfirmActionModal
    v-model:open="isQuitModalOpen"
    :title="`Quit ${roomName}?`"
    description="You stop being a member and the room disappears from your rooms. You can join again later with the room link."
    confirm-label="Quit room"
    :icon="LeaveRoomIcon"
    variant="danger"
    :is-submitting="isQuittingRoom"
    @confirmed="handleQuitConfirmed"
  />
</template>
