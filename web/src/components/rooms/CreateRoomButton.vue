<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import { describeError } from '@/services/describe-error'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { useMyRoomsStore } from '@/stores/my-rooms-store'
import { AddIcon } from '@/theme/app-icons'
import type { ControlSize } from '@/theme/component-sizes'
import RoomNameDialog from './RoomNameDialog.vue'

interface CreateRoomButtonProps {
  size?: ControlSize
}

withDefaults(defineProps<CreateRoomButtonProps>(), {
  size: 'md',
})

const router = useRouter()
const myRoomsStore = useMyRoomsStore()
const actionFeedbackStore = useActionFeedbackStore()

const isCreateRoomDialogOpen = ref(false)
const isCreatingRoom = ref(false)

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
</script>

<template>
  <BaseButton
    :leading-icon="AddIcon"
    :size="size"
    :is-disabled="!myRoomsStore.canCreateRoom"
    @click="handleCreateRoomButtonClick"
  >
    Create a room
  </BaseButton>
  <RoomNameDialog
    v-model:open="isCreateRoomDialogOpen"
    title="Create a room"
    confirm-label="Create room"
    :confirm-icon="AddIcon"
    :is-submitting="isCreatingRoom"
    @room-name-submitted="handleRoomNameSubmitted"
  />
</template>
