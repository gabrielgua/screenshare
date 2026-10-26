import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { refDebounced } from '@vueuse/core'
import { describeError } from '@/services/describe-error'
import { fetchAllRooms, type AdministeredRoom } from '@/services/rooms-service'

const SEARCH_DEBOUNCE_MILLISECONDS = 300

export const useAdministeredRoomsStore = defineStore('administered-rooms', () => {
  const administeredRooms = ref<AdministeredRoom[]>([])
  const isLoadingAdministeredRooms = ref(false)
  const loadErrorMessage = ref<string>()

  const searchTerm = ref('')
  const debouncedSearchTerm = refDebounced(searchTerm, SEARCH_DEBOUNCE_MILLISECONDS)

  const administeredRoomCount = computed(() => administeredRooms.value.length)
  const hasAdministeredRooms = computed(() => administeredRoomCount.value > 0)
  const normalizedSearchTerm = computed(() => debouncedSearchTerm.value.trim().toLocaleLowerCase())
  const hasActiveFilters = computed(() => searchTerm.value.trim().length > 0)

  const filteredAdministeredRooms = computed(() =>
    administeredRooms.value.filter((administeredRoom) =>
      `${administeredRoom.name} ${administeredRoom.ownerName}`
        .toLocaleLowerCase()
        .includes(normalizedSearchTerm.value),
    ),
  )
  const filteredAdministeredRoomCount = computed(() => filteredAdministeredRooms.value.length)

  function clearFilters() {
    searchTerm.value = ''
  }

  async function loadAdministeredRooms() {
    isLoadingAdministeredRooms.value = true
    loadErrorMessage.value = undefined
    try {
      administeredRooms.value = await fetchAllRooms()
    } catch (loadError) {
      loadErrorMessage.value = describeError(loadError, 'Could not load the rooms')
    } finally {
      isLoadingAdministeredRooms.value = false
    }
  }

  return {
    administeredRooms,
    isLoadingAdministeredRooms,
    loadErrorMessage,
    searchTerm,
    administeredRoomCount,
    hasAdministeredRooms,
    hasActiveFilters,
    filteredAdministeredRooms,
    filteredAdministeredRoomCount,
    clearFilters,
    loadAdministeredRooms,
  }
})
