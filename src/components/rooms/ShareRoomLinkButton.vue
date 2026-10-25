<script setup lang="ts">
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import BaseButton from '@/components/button/BaseButton.vue'
import { buildRoomShareUrl } from '@/services/rooms-service'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { ApproveIcon, InviteLinkIcon } from '@/theme/app-icons'

interface ShareRoomLinkButtonProps {
  roomId: string
}

const props = defineProps<ShareRoomLinkButtonProps>()

const COPIED_LABEL_DURATION_MILLISECONDS = 2000

const actionFeedbackStore = useActionFeedbackStore()
const { copy, copied, isSupported } = useClipboard({
  copiedDuring: COPIED_LABEL_DURATION_MILLISECONDS,
  legacy: true,
})

const roomShareUrl = computed(() => buildRoomShareUrl(props.roomId))

async function handleShareButtonClick() {
  if (!isSupported.value) {
    actionFeedbackStore.showErrorFeedback(
      'Copying is not available',
      `Copy this link by hand: ${roomShareUrl.value}`,
    )
    return
  }
  await copy(roomShareUrl.value)
}
</script>

<template>
  <BaseButton
    variant="primary"
    :leading-icon="copied ? ApproveIcon : InviteLinkIcon"
    aria-live="polite"
    @click="handleShareButtonClick"
  >
    {{ copied ? 'Link copied' : 'Share link' }}
  </BaseButton>
</template>
