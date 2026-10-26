<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseModal from '@/components/dialog/BaseModal.vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useActionFeedbackStore, type ActionFeedbackKind } from '@/stores/action-feedback-store'
import { SuccessIcon, WarningIcon, type AppIcon } from '@/theme/app-icons'
import type { ColorVariant } from '@/theme/color-variants'
import AutoCloseCountdownBar from './AutoCloseCountdownBar.vue'

const actionFeedbackStore = useActionFeedbackStore()

const iconByKind: Record<ActionFeedbackKind, AppIcon> = {
  success: SuccessIcon,
  error: WarningIcon,
}

const iconVariantByKind: Record<ActionFeedbackKind, ColorVariant> = {
  success: 'success',
  error: 'danger',
}

const isOpen = computed({
  get: () => actionFeedbackStore.isFeedbackOpen,
  set: (shouldBeOpen: boolean) => {
    if (!shouldBeOpen) {
      actionFeedbackStore.closeFeedback()
    }
  },
})

function handleCloseButtonClick() {
  actionFeedbackStore.closeFeedback()
}
</script>

<template>
  <BaseModal v-model:open="isOpen" width="compact">
    <div
      v-if="actionFeedbackStore.visibleFeedback"
      :key="actionFeedbackStore.visibleFeedback.id"
      class="flex flex-col items-center gap-3 px-6 pt-8 pb-5 text-center"
      role="status"
      aria-live="polite"
    >
      <BaseIconCircle
        :icon="iconByKind[actionFeedbackStore.visibleFeedback.kind]"
        :variant="iconVariantByKind[actionFeedbackStore.visibleFeedback.kind]"
        size="lg"
        class="animate-pop-in motion-reduce:animate-none"
      />
      <BaseHeading :level="2" size="subtitle">
        {{ actionFeedbackStore.visibleFeedback.title }}
      </BaseHeading>
      <BaseText v-if="actionFeedbackStore.visibleFeedback.message" tone="muted">
        {{ actionFeedbackStore.visibleFeedback.message }}
      </BaseText>
      <AutoCloseCountdownBar
        v-if="actionFeedbackStore.visibleFeedback.shouldAutoClose"
        :kind="actionFeedbackStore.visibleFeedback.kind"
        :duration-in-milliseconds="actionFeedbackStore.visibleFeedback.autoCloseAfterMilliseconds"
        class="mt-3"
      />
      <BaseButton
        v-else
        variant="neutral"
        appearance="outlined"
        is-full-width
        class="mt-3"
        @click="handleCloseButtonClick"
      >
        Close
      </BaseButton>
    </div>
  </BaseModal>
</template>
