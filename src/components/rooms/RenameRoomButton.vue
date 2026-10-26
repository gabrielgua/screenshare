<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import { describeError } from '@/services/describe-error'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { useRoomStore } from '@/stores/room-store'
import { EditIcon } from '@/theme/app-icons'
import RoomNameDialog from './RoomNameDialog.vue'

interface RenameRoomButtonProps {
  roomName: string
}

defineOptions({ inheritAttrs: false })

defineProps<RenameRoomButtonProps>()

const roomStore = useRoomStore()
const actionFeedbackStore = useActionFeedbackStore()

const isRenameDialogOpen = ref(false)
const isRenamingRoom = ref(false)

function handleRenameButtonClick() {
  isRenameDialogOpen.value = true
}

async function handleRoomNameSubmitted(newRoomName: string) {
  isRenamingRoom.value = true
  try {
    await roomStore.renameRequestedRoom(newRoomName)
    isRenameDialogOpen.value = false
    actionFeedbackStore.showSuccessFeedback('Room renamed', `It is now called ${newRoomName}.`)
  } catch (renameError) {
    actionFeedbackStore.showErrorFeedback(
      'Could not rename the room',
      describeError(renameError, 'Something went wrong. Please try again.'),
    )
  } finally {
    isRenamingRoom.value = false
  }
}
</script>

<template>
  <BaseButton
    v-bind="$attrs"
    variant="neutral"
    appearance="outlined"
    :leading-icon="EditIcon"
    @click="handleRenameButtonClick"
  >
    Rename
  </BaseButton>
  <RoomNameDialog
    v-model:open="isRenameDialogOpen"
    title="Rename room"
    confirm-label="Save name"
    :confirm-icon="EditIcon"
    :initial-room-name="roomName"
    :is-submitting="isRenamingRoom"
    @room-name-submitted="handleRoomNameSubmitted"
  />
</template>
