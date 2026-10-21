<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import BaseTextarea from '@/components/form/BaseTextarea.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { PlatformUser, UserReviewDecision } from '@/services/users-service'
import { ApproveIcon, DenyIcon } from '@/theme/app-icons'

interface ReviewUserDialogProps {
  reviewedUser?: PlatformUser
  decision: UserReviewDecision
  isSubmitting?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<ReviewUserDialogProps>(), {
  reviewedUser: undefined,
  isSubmitting: false,
  errorMessage: undefined,
})

const emit = defineEmits<{
  reviewSubmitted: [reason?: string]
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const MAXIMUM_REASON_LENGTH = 500

const reason = ref('')

const isApproval = computed(() => props.decision === 'approved')
const reviewedUserName = computed(() => props.reviewedUser?.displayName ?? 'this user')
const dialogTitle = computed(() =>
  isApproval.value ? `Approve ${reviewedUserName.value}?` : `Deny ${reviewedUserName.value}?`,
)
const dialogDescription = computed(() =>
  isApproval.value
    ? 'They will get access to the platform right away.'
    : 'They will not be able to use the platform. They will see the reason below, if you add one.',
)

watch(isOpen, (isNowOpen) => {
  if (isNowOpen) {
    reason.value = ''
  }
})

function handleCancelButtonClick() {
  isOpen.value = false
}

function handleConfirmButtonClick() {
  const trimmedReason = reason.value.trim()
  emit('reviewSubmitted', trimmedReason.length > 0 ? trimmedReason : undefined)
}
</script>

<template>
  <BaseDialog v-model:open="isOpen" :title="dialogTitle" :is-close-blocked="isSubmitting">
    <BaseText tone="muted">{{ dialogDescription }}</BaseText>
    <BaseTextarea
      v-model="reason"
      label="Reason"
      hint="Optional. Up to 500 characters."
      placeholder="Add a short note about this decision"
      :maximum-length="MAXIMUM_REASON_LENGTH"
      :visible-row-count="3"
      :is-disabled="isSubmitting"
      :status="errorMessage ? 'danger' : 'default'"
      :status-message="errorMessage"
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
        :variant="isApproval ? 'success' : 'danger'"
        :leading-icon="isApproval ? ApproveIcon : DenyIcon"
        :is-loading="isSubmitting"
        @click="handleConfirmButtonClick"
      >
        {{ isApproval ? 'Approve' : 'Deny' }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>
