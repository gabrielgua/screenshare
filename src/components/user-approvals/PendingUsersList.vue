<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LoadErrorRetry from '@/components/feedback/LoadErrorRetry.vue'
import PageLoadingSpinner from '@/components/layout/PageLoadingSpinner.vue'
import PageTransition from '@/components/layout/PageTransition.vue'
import StaggeredListTransition from '@/components/layout/StaggeredListTransition.vue'
import { describeError } from '@/services/describe-error'
import type { PlatformUser, UserReviewDecision } from '@/services/users-service'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { usePendingUsersStore } from '@/stores/pending-users-store'
import PendingUserCard from './PendingUserCard.vue'
import PendingUsersEmptyState from './PendingUsersEmptyState.vue'
import ReviewUserDialog from './ReviewUserDialog.vue'

const pendingUsersStore = usePendingUsersStore()
const actionFeedbackStore = useActionFeedbackStore()

const isReviewDialogOpen = ref(false)
const userUnderReview = ref<PlatformUser>()
const selectedDecision = ref<UserReviewDecision>('approved')
const isSubmittingReview = ref(false)

onMounted(() => {
  pendingUsersStore.loadPendingUsers()
})

function openReviewDialog(pendingUser: PlatformUser, decision: UserReviewDecision) {
  userUnderReview.value = pendingUser
  selectedDecision.value = decision
  isReviewDialogOpen.value = true
}

function showReviewSuccessFeedback(
  reviewedUserName: string,
  decision: UserReviewDecision,
  hasMessage: boolean,
) {
  if (decision === 'approved') {
    actionFeedbackStore.showSuccessFeedback(
      `${reviewedUserName} is in!`,
      hasMessage
        ? 'They can use the platform now and will see your welcome message.'
        : 'They can use the platform now.',
    )
    return
  }
  actionFeedbackStore.showSuccessFeedback(
    `${reviewedUserName} was denied`,
    hasMessage
      ? 'They will see your reason the next time they open the app.'
      : 'They will not be able to use the platform.',
  )
}

async function submitReview(reviewMessage?: string) {
  const reviewedUser = userUnderReview.value
  if (!reviewedUser) {
    return
  }
  isSubmittingReview.value = true
  try {
    await pendingUsersStore.reviewPendingUser(
      reviewedUser.id,
      selectedDecision.value,
      reviewMessage,
    )
    isReviewDialogOpen.value = false
    showReviewSuccessFeedback(
      reviewedUser.displayName,
      selectedDecision.value,
      reviewMessage !== undefined,
    )
  } catch (reviewError) {
    actionFeedbackStore.showErrorFeedback(
      'Could not save this review',
      describeError(reviewError, 'Something went wrong. Please try again.'),
    )
  } finally {
    isSubmittingReview.value = false
  }
}

function handleRetryRequested() {
  pendingUsersStore.loadPendingUsers()
}
</script>

<template>
  <PageTransition>
    <PageLoadingSpinner
      v-if="pendingUsersStore.isLoadingPendingUsers && !pendingUsersStore.hasPendingUsers"
      accessible-label="Loading pending users"
    />
    <LoadErrorRetry
      v-else-if="pendingUsersStore.loadErrorMessage"
      :error-message="pendingUsersStore.loadErrorMessage"
      @retry-requested="handleRetryRequested"
    />
    <PendingUsersEmptyState v-else-if="!pendingUsersStore.hasPendingUsers" />
    <StaggeredListTransition v-else tag="ul" class="flex flex-col gap-3">
      <li
        v-for="(pendingUser, listPosition) in pendingUsersStore.pendingUsers"
        :key="pendingUser.id"
        :data-stagger-index="listPosition"
      >
        <PendingUserCard
          :pending-user="pendingUser"
          @review-requested="(decision) => openReviewDialog(pendingUser, decision)"
        />
      </li>
    </StaggeredListTransition>
  </PageTransition>

  <ReviewUserDialog
    v-model:open="isReviewDialogOpen"
    :reviewed-user="userUnderReview"
    :decision="selectedDecision"
    :is-submitting="isSubmittingReview"
    @review-submitted="submitReview"
  />
</template>
