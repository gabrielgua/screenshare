<script setup lang="ts">
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseTooltip from '@/components/tooltip/BaseTooltip.vue'
import { buildRoomShareUrl } from '@/services/rooms-service'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { ApproveIcon, InviteLinkIcon } from '@/theme/app-icons'
import type { ControlSize } from '@/theme/component-sizes'

interface ShareRoomLinkButtonProps {
  roomId: string
  isIconOnly?: boolean
  isFullWidth?: boolean
  size?: ControlSize
}

const props = withDefaults(defineProps<ShareRoomLinkButtonProps>(), {
  isIconOnly: false,
  isFullWidth: false,
  size: 'md',
})

const COPIED_LABEL_DURATION_MILLISECONDS = 2000

const actionFeedbackStore = useActionFeedbackStore()
const { copy, copied, isSupported } = useClipboard({
  copiedDuring: COPIED_LABEL_DURATION_MILLISECONDS,
  legacy: true,
})

const roomShareUrl = computed(() => buildRoomShareUrl(props.roomId))
const shareButtonLabel = computed(() => (copied.value ? 'Link copied' : 'Share link'))

async function handleShareButtonClick() {
  if (!isSupported.value) {
    actionFeedbackStore.showErrorFeedback(
      'Copying is not available',
      `Copy this link by hand: ${roomShareUrl.value}`,
      { shouldAutoClose: false },
    )
    return
  }
  await copy(roomShareUrl.value)
}
</script>

<template>
  <BaseTooltip
    :text="shareButtonLabel"
    placement="bottom"
    :is-disabled="!isIconOnly"
    :class="{ 'w-full': isFullWidth }"
  >
    <BaseButton
      variant="primary"
      :size="size"
      :leading-icon="copied ? ApproveIcon : InviteLinkIcon"
      :is-icon-only="isIconOnly"
      :is-full-width="isFullWidth"
      :aria-label="isIconOnly ? shareButtonLabel : undefined"
      aria-live="polite"
      @click="handleShareButtonClick"
    >
      <template v-if="!isIconOnly">{{ shareButtonLabel }}</template>
    </BaseButton>
  </BaseTooltip>
</template>
