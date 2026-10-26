<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { PlatformUser, UserReviewDecision } from '@/services/users-service'
import { ApproveIcon, DenyIcon } from '@/theme/app-icons'

interface PendingUserCardProps {
  pendingUser: PlatformUser
}

const props = defineProps<PendingUserCardProps>()

const emit = defineEmits<{
  reviewRequested: [decision: UserReviewDecision]
}>()

const timeSinceSignUp = useTimeAgo(() => props.pendingUser.createdAt)

function handleApproveButtonClick() {
  emit('reviewRequested', 'approved')
}

function handleDenyButtonClick() {
  emit('reviewRequested', 'denied')
}
</script>

<template>
  <BaseCard
    as="article"
    padding="compact"
    class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex min-w-0 items-center gap-3">
      <BaseAvatar :name="pendingUser.displayName" :image-url="pendingUser.avatarUrl" />
      <div class="flex min-w-0 flex-col">
        <BaseText weight="semibold" class="truncate">{{ pendingUser.displayName }}</BaseText>
        <BaseText v-if="pendingUser.email" size="sm" tone="muted" class="truncate">
          {{ pendingUser.email }}
        </BaseText>
        <BaseText size="caption" tone="subtle">Signed up {{ timeSinceSignUp }}</BaseText>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
      <BaseButton
        variant="danger"
        appearance="outlined"
        :leading-icon="DenyIcon"
        @click="handleDenyButtonClick"
      >
        Deny
      </BaseButton>
      <BaseButton variant="success" :leading-icon="ApproveIcon" @click="handleApproveButtonClick">
        Approve
      </BaseButton>
    </div>
  </BaseCard>
</template>
