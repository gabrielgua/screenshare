import { defineStore } from 'pinia'
import { ref } from 'vue'
import { describeError } from '@/services/describe-error'
import {
  fetchUserDetails,
  setUserActive,
  setUserRole,
  type PlatformUser,
  type PlatformUserDetails,
  type UserRole,
} from '@/services/users-service'

export const useUserDetailsStore = defineStore('user-details', () => {
  const viewedUser = ref<PlatformUserDetails>()
  const isLoadingViewedUser = ref(false)
  const loadErrorMessage = ref<string>()

  function mergeUpdatedUser(updatedUser: PlatformUser) {
    if (viewedUser.value?.id === updatedUser.id) {
      viewedUser.value = { ...viewedUser.value, ...updatedUser }
    }
  }

  async function loadViewedUser(userId: string) {
    isLoadingViewedUser.value = true
    loadErrorMessage.value = undefined
    if (viewedUser.value?.id !== userId) {
      viewedUser.value = undefined
    }
    try {
      viewedUser.value = await fetchUserDetails(userId)
      if (!viewedUser.value) {
        loadErrorMessage.value = 'This user does not exist.'
      }
    } catch (loadError) {
      loadErrorMessage.value = describeError(loadError, 'Could not load this user')
    } finally {
      isLoadingViewedUser.value = false
    }
  }

  async function changeViewedUserActivation(shouldBeActive: boolean) {
    if (viewedUser.value) {
      mergeUpdatedUser(await setUserActive(viewedUser.value.id, shouldBeActive))
    }
  }

  async function changeViewedUserRole(newRole: UserRole) {
    if (viewedUser.value) {
      mergeUpdatedUser(await setUserRole(viewedUser.value.id, newRole))
    }
  }

  return {
    viewedUser,
    isLoadingViewedUser,
    loadErrorMessage,
    loadViewedUser,
    changeViewedUserActivation,
    changeViewedUserRole,
  }
})
