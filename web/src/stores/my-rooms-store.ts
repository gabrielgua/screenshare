import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { describeError } from '@/services/describe-error'
import { createRoom, fetchMyRooms, type Room, type RoomSummary } from '@/services/rooms-service'
import { useCurrentUserStore } from '@/stores/current-user-store'

export const useMyRoomsStore = defineStore('my-rooms', () => {
  const currentUserStore = useCurrentUserStore()

  const myRooms = ref<RoomSummary[]>([])
  const isLoadingMyRooms = ref(false)
  const hasLoadedMyRooms = ref(false)
  const loadErrorMessage = ref<string>()

  const hasRooms = computed(() => myRooms.value.length > 0)
  const ownsARoom = computed(() => myRooms.value.some((roomSummary) => roomSummary.isOwner))
  const canCreateRoom = computed(() => currentUserStore.isAdmin || !ownsARoom.value)

  async function loadMyRooms() {
    isLoadingMyRooms.value = true
    loadErrorMessage.value = undefined
    try {
      myRooms.value = await fetchMyRooms()
      hasLoadedMyRooms.value = true
    } catch (loadError) {
      loadErrorMessage.value = describeError(loadError, 'Could not load your rooms')
    } finally {
      isLoadingMyRooms.value = false
    }
  }

  async function createNewRoom(roomName: string): Promise<Room> {
    const createdRoom = await createRoom(roomName)
    await loadMyRooms()
    return createdRoom
  }

  return {
    myRooms,
    isLoadingMyRooms,
    hasLoadedMyRooms,
    loadErrorMessage,
    hasRooms,
    ownsARoom,
    canCreateRoom,
    loadMyRooms,
    createNewRoom,
  }
})
