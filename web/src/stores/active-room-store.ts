import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import type { PresentRoomUser } from '@/services/room-presence-service'

export interface ActiveRoom {
  id: string
  name: string
}

export const useActiveRoomStore = defineStore('active-room', () => {
  const activeRoom = ref<ActiveRoom>()
  const presentUsers = shallowRef<PresentRoomUser[]>([])
  const screenShares = shallowRef<RoomScreenShare[]>([])

  function enterRoom(room: ActiveRoom) {
    activeRoom.value = { ...room }
  }

  function leaveRoom() {
    activeRoom.value = undefined
    presentUsers.value = []
    screenShares.value = []
  }

  function isActiveRoom(roomId: string | undefined): boolean {
    return roomId !== undefined && activeRoom.value?.id === roomId
  }

  function publishSessionState(
    currentPresentUsers: PresentRoomUser[],
    currentScreenShares: RoomScreenShare[],
  ) {
    presentUsers.value = currentPresentUsers
    screenShares.value = currentScreenShares
  }

  return {
    activeRoom,
    presentUsers,
    screenShares,
    enterRoom,
    leaveRoom,
    isActiveRoom,
    publishSessionState,
  }
})
