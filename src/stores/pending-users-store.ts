import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { describeError } from '@/services/describe-error'
import {
  fetchPendingUsers,
  reviewUser,
  type PlatformUser,
  type UserReviewDecision,
} from '@/services/users-service'

export const usePendingUsersStore = defineStore('pending-users', () => {
  const pendingUsers = ref<PlatformUser[]>([])
  const isLoadingPendingUsers = ref(false)
  const loadErrorMessage = ref<string>()

  const pendingUserCount = computed(() => pendingUsers.value.length)
  const hasPendingUsers = computed(() => pendingUserCount.value > 0)

  async function loadPendingUsers() {
    isLoadingPendingUsers.value = true
    loadErrorMessage.value = undefined
    try {
      pendingUsers.value = await fetchPendingUsers()
    } catch (loadError) {
      loadErrorMessage.value = describeError(loadError, 'Could not load pending users')
    } finally {
      isLoadingPendingUsers.value = false
    }
  }

  async function reviewPendingUser(
    targetUserId: string,
    decision: UserReviewDecision,
    message?: string,
  ) {
    await reviewUser(targetUserId, decision, message)
    pendingUsers.value = pendingUsers.value.filter((pendingUser) => pendingUser.id !== targetUserId)
  }

  return {
    pendingUsers,
    isLoadingPendingUsers,
    loadErrorMessage,
    pendingUserCount,
    hasPendingUsers,
    loadPendingUsers,
    reviewPendingUser,
  }
})
