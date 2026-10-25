<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import { MAXIMUM_ROOM_NAME_LENGTH } from '@/services/rooms-service'
import type { AppIcon } from '@/theme/app-icons'

interface RoomNameDialogProps {
  title: string
  confirmLabel: string
  confirmIcon: AppIcon
  initialRoomName?: string
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<RoomNameDialogProps>(), {
  initialRoomName: '',
  isSubmitting: false,
})

const emit = defineEmits<{
  roomNameSubmitted: [roomName: string]
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const roomName = ref('')

const trimmedRoomName = computed(() => roomName.value.trim())
const isRoomNameTooLong = computed(() => trimmedRoomName.value.length > MAXIMUM_ROOM_NAME_LENGTH)
const canSubmit = computed(
  () =>
    trimmedRoomName.value.length > 0 &&
    !isRoomNameTooLong.value &&
    trimmedRoomName.value !== props.initialRoomName,
)

watch(isOpen, (isNowOpen) => {
  if (isNowOpen) {
    roomName.value = props.initialRoomName
  }
})

function handleCancelButtonClick() {
  isOpen.value = false
}

function handleRoomNameSubmit() {
  if (canSubmit.value) {
    emit('roomNameSubmitted', trimmedRoomName.value)
  }
}
</script>

<template>
  <BaseDialog v-model:open="isOpen" :title="title" :is-close-blocked="isSubmitting">
    <form id="room-name-form" @submit.prevent="handleRoomNameSubmit">
      <BaseInput
        v-model="roomName"
        label="Room name"
        placeholder="Friday movie night"
        autocomplete="off"
        :hint="`Up to ${MAXIMUM_ROOM_NAME_LENGTH} characters.`"
        :status="isRoomNameTooLong ? 'danger' : 'default'"
        :status-message="isRoomNameTooLong ? 'This name is too long.' : undefined"
        :is-disabled="isSubmitting"
        is-required
      />
    </form>
    <template #actions>
      <BaseButton
        variant="neutral"
        appearance="outlined"
        :is-disabled="isSubmitting"
        @click="handleCancelButtonClick"
      >
        Cancel
      </BaseButton>
      <BaseButton
        type="submit"
        form="room-name-form"
        :leading-icon="confirmIcon"
        :is-loading="isSubmitting"
        :is-disabled="!canSubmit"
      >
        {{ confirmLabel }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>
