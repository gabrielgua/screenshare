import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { refDebounced } from '@vueuse/core'
import { describeError } from '@/services/describe-error'
import {
  fetchAllUsers,
  type PlatformUser,
  type UserApprovalStatus,
  type UserRole,
} from '@/services/users-service'

const SEARCH_DEBOUNCE_MILLISECONDS = 300

export const useRegisteredUsersStore = defineStore('registered-users', () => {
  const registeredUsers = ref<PlatformUser[]>([])
  const isLoadingRegisteredUsers = ref(false)
  const loadErrorMessage = ref<string>()

  const searchTerm = ref('')
  const debouncedSearchTerm = refDebounced(searchTerm, SEARCH_DEBOUNCE_MILLISECONDS)
  const selectedRoles = ref<UserRole[]>([])
  const selectedApprovalStatuses = ref<UserApprovalStatus[]>([])

  const registeredUserCount = computed(() => registeredUsers.value.length)
  const hasRegisteredUsers = computed(() => registeredUserCount.value > 0)

  const normalizedSearchTerm = computed(() => debouncedSearchTerm.value.trim().toLocaleLowerCase())
  const hasActiveFilters = computed(
    () =>
      searchTerm.value.trim().length > 0 ||
      selectedRoles.value.length > 0 ||
      selectedApprovalStatuses.value.length > 0,
  )

  function matchesSearchTerm(registeredUser: PlatformUser): boolean {
    if (normalizedSearchTerm.value.length === 0) {
      return true
    }
    const searchableText = `${registeredUser.displayName} ${registeredUser.email ?? ''}`
    return searchableText.toLocaleLowerCase().includes(normalizedSearchTerm.value)
  }

  function matchesSelectedRoles(registeredUser: PlatformUser): boolean {
    return selectedRoles.value.length === 0 || selectedRoles.value.includes(registeredUser.role)
  }

  function matchesSelectedApprovalStatuses(registeredUser: PlatformUser): boolean {
    return (
      selectedApprovalStatuses.value.length === 0 ||
      selectedApprovalStatuses.value.includes(registeredUser.approvalStatus)
    )
  }

  const filteredRegisteredUsers = computed(() =>
    registeredUsers.value.filter(
      (registeredUser) =>
        matchesSearchTerm(registeredUser) &&
        matchesSelectedRoles(registeredUser) &&
        matchesSelectedApprovalStatuses(registeredUser),
    ),
  )
  const filteredRegisteredUserCount = computed(() => filteredRegisteredUsers.value.length)

  function clearFilters() {
    searchTerm.value = ''
    selectedRoles.value = []
    selectedApprovalStatuses.value = []
  }

  async function loadRegisteredUsers() {
    isLoadingRegisteredUsers.value = true
    loadErrorMessage.value = undefined
    try {
      registeredUsers.value = await fetchAllUsers()
    } catch (loadError) {
      loadErrorMessage.value = describeError(loadError, 'Could not load the registered users')
    } finally {
      isLoadingRegisteredUsers.value = false
    }
  }

  return {
    registeredUsers,
    isLoadingRegisteredUsers,
    loadErrorMessage,
    searchTerm,
    selectedRoles,
    selectedApprovalStatuses,
    registeredUserCount,
    hasRegisteredUsers,
    hasActiveFilters,
    filteredRegisteredUsers,
    filteredRegisteredUserCount,
    clearFilters,
    loadRegisteredUsers,
  }
})
