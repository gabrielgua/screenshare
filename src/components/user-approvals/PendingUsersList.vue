<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import PageLoadingSpinner from '@/components/layout/PageLoadingSpinner.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { PlatformUser, UserReviewDecision } from '@/services/users-service'
import { usePendingUsersStore } from '@/stores/pending-users-store'
import PendingUserCard from './PendingUserCard.vue'
import PendingUsersEmptyState from './PendingUsersEmptyState.vue'
import ReviewUserDialog from './ReviewUserDialog.vue'

const pendingUsersStore = usePendingUsersStore()

const isReviewDialogOpen = ref(false)
const userUnderReview = ref<PlatformUser>()
const selectedDecision = ref<UserReviewDecision>('approved')
const isSubmittingReview = ref(false)
const reviewErrorMessage = ref<string>()

onMounted(() => {
  pendingUsersStore.loadPendingUsers()
})

function openReviewDialog(pendingUser: PlatformUser, decision: UserReviewDecision) {
  userUnderReview.value = pendingUser
  selectedDecision.value = decision
  reviewErrorMessage.value = undefined
  isReviewDialogOpen.value = true
}

async function submitReview(reason?: string) {
  if (!userUnderReview.value) {
    return
  }
  isSubmittingReview.value = true
  reviewErrorMessage.value = undefined
  try {
    await pendingUsersStore.reviewPendingUser(
      userUnderReview.value.id,
      selectedDecision.value,
      reason,
    )
    isReviewDialogOpen.value = false
  } catch (reviewError) {
    reviewErrorMessage.value =
      reviewError instanceof Error ? reviewError.message : 'Could not save this review'
  } finally {
    isSubmittingReview.value = false
  }
}

function handleRetryButtonClick() {
  pendingUsersStore.loadPendingUsers()
}
</script>

<template>
  <PageLoadingSpinner
    v-if="pendingUsersStore.isLoadingPendingUsers && !pendingUsersStore.hasPendingUsers"
    accessible-label="Loading pending users"
  />
  <div
    v-else-if="pendingUsersStore.loadErrorMessage"
    class="flex flex-col items-center gap-3 py-10 text-center"
  >
    <BaseText tone="danger" role="alert">{{ pendingUsersStore.loadErrorMessage }}</BaseText>
    <BaseButton variant="neutral" appearance="outlined" @click="handleRetryButtonClick">
      Try again
    </BaseButton>
  </div>
  <PendingUsersEmptyState v-else-if="!pendingUsersStore.hasPendingUsers" />
  <ul v-else class="flex flex-col gap-3">
    <li v-for="pendingUser in pendingUsersStore.pendingUsers" :key="pendingUser.id">
      <PendingUserCard
        :pending-user="pendingUser"
        @review-requested="(decision) => openReviewDialog(pendingUser, decision)"
      />
    </li>
  </ul>

  <ReviewUserDialog
    v-model:open="isReviewDialogOpen"
    :reviewed-user="userUnderReview"
    :decision="selectedDecision"
    :is-submitting="isSubmittingReview"
    :error-message="reviewErrorMessage"
    @review-submitted="submitReview"
  />
</template>
