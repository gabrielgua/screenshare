<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import BaseTextarea from '@/components/form/BaseTextarea.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { PlatformUser, UserReviewDecision } from '@/services/users-service'
import { ApproveIcon, DenyIcon, type AppIcon } from '@/theme/app-icons'
import type { ColorVariant } from '@/theme/color-variants'

interface ReviewUserDialogProps {
  reviewedUser?: PlatformUser
  decision: UserReviewDecision
  isSubmitting?: boolean
}

interface ReviewDecisionCopy {
  titlePrefix: string
  description: string
  messageLabel: string
  messagePlaceholder: string
  confirmLabel: string
}

const props = withDefaults(defineProps<ReviewUserDialogProps>(), {
  reviewedUser: undefined,
  isSubmitting: false,
})

const emit = defineEmits<{
  reviewSubmitted: [message?: string]
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const MAXIMUM_MESSAGE_LENGTH = 500

const copyByDecision: Record<UserReviewDecision, ReviewDecisionCopy> = {
  approved: {
    titlePrefix: 'Approve',
    description: 'They will get access to the platform right away.',
    messageLabel: 'Welcome message',
    messagePlaceholder: 'Send a welcome message',
    confirmLabel: 'Approve',
  },
  denied: {
    titlePrefix: 'Deny',
    description:
      'They will not be able to use the platform. They will see your reason, if you add one.',
    messageLabel: 'Reason',
    messagePlaceholder: 'Let them know why',
    confirmLabel: 'Deny',
  },
}

const confirmVariantByDecision: Record<UserReviewDecision, ColorVariant> = {
  approved: 'success',
  denied: 'danger',
}

const confirmIconByDecision: Record<UserReviewDecision, AppIcon> = {
  approved: ApproveIcon,
  denied: DenyIcon,
}

const reviewMessage = ref('')

const decisionCopy = computed(() => copyByDecision[props.decision])
const reviewedUserName = computed(() => props.reviewedUser?.displayName ?? 'this user')
const dialogTitle = computed(() => `${decisionCopy.value.titlePrefix} ${reviewedUserName.value}?`)

watch(isOpen, (isNowOpen) => {
  if (isNowOpen) {
    reviewMessage.value = ''
  }
})

function handleCancelButtonClick() {
  isOpen.value = false
}

function handleConfirmButtonClick() {
  const trimmedMessage = reviewMessage.value.trim()
  emit('reviewSubmitted', trimmedMessage.length > 0 ? trimmedMessage : undefined)
}
</script>

<template>
  <BaseDialog v-model:open="isOpen" :title="dialogTitle" :is-close-blocked="isSubmitting">
    <BaseText tone="muted">{{ decisionCopy.description }}</BaseText>
    <BaseTextarea
      v-model="reviewMessage"
      :label="decisionCopy.messageLabel"
      hint="Optional. Up to 500 characters."
      :placeholder="decisionCopy.messagePlaceholder"
      :maximum-length="MAXIMUM_MESSAGE_LENGTH"
      :visible-row-count="3"
      :is-disabled="isSubmitting"
    />
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
        :variant="confirmVariantByDecision[decision]"
        :leading-icon="confirmIconByDecision[decision]"
        :is-loading="isSubmitting"
        @click="handleConfirmButtonClick"
      >
        {{ decisionCopy.confirmLabel }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>
