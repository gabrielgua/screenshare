import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { until, useWindowFocus } from '@vueuse/core'
import { fetchUserById, type PlatformUser } from '@/services/users-service'
import { useAuthenticationStore } from '@/stores/authentication-store'

export const useCurrentUserStore = defineStore('current-user', () => {
  const authenticationStore = useAuthenticationStore()
  const isWindowFocused = useWindowFocus()

  const currentUser = ref<PlatformUser>()
  const isLoadingCurrentUser = ref(false)
  const hasResolvedCurrentUser = ref(false)
  const loadErrorMessage = ref<string>()

  const isAdmin = computed(
    () => currentUser.value?.role === 'admin' && currentUser.value.approvalStatus === 'approved',
  )
  const isApproved = computed(() => currentUser.value?.approvalStatus === 'approved')
  const isPendingApproval = computed(() => currentUser.value?.approvalStatus === 'pending')
  const isDenied = computed(() => currentUser.value?.approvalStatus === 'denied')

  async function loadCurrentUser(signedInUserId: string) {
    isLoadingCurrentUser.value = true
    loadErrorMessage.value = undefined
    try {
      currentUser.value = await fetchUserById(signedInUserId)
    } catch (loadError) {
      loadErrorMessage.value =
        loadError instanceof Error ? loadError.message : 'Could not load your account'
    } finally {
      isLoadingCurrentUser.value = false
      hasResolvedCurrentUser.value = true
    }
  }

  function clearCurrentUser() {
    currentUser.value = undefined
    hasResolvedCurrentUser.value = !authenticationStore.isRestoringSession
  }

  async function waitUntilCurrentUserIsResolved() {
    await until(() => authenticationStore.isRestoringSession).toBe(false)
    if (authenticationStore.isSignedIn) {
      await until(hasResolvedCurrentUser).toBe(true)
    }
  }

  watch(
    () => authenticationStore.signedInUser?.id,
    (signedInUserId) => {
      hasResolvedCurrentUser.value = false
      if (signedInUserId) {
        loadCurrentUser(signedInUserId)
      } else {
        clearCurrentUser()
      }
    },
    { immediate: true },
  )

  watch(isWindowFocused, (isFocused) => {
    const signedInUserId = authenticationStore.signedInUser?.id
    if (isFocused && signedInUserId && !isApproved.value) {
      loadCurrentUser(signedInUserId)
    }
  })

  return {
    currentUser,
    isLoadingCurrentUser,
    hasResolvedCurrentUser,
    loadErrorMessage,
    isAdmin,
    isApproved,
    isPendingApproval,
    isDenied,
    waitUntilCurrentUserIsResolved,
  }
})
