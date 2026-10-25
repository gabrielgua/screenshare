import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { describeError } from '@/services/describe-error'
import {
  fetchRoom,
  fetchRoomBlockedUsers,
  fetchRoomMembers,
  fetchRoomPreview,
  isValidRoomId,
  joinRoom,
  leaveRoom,
  removeRoomMember,
  renameRoom,
  unblockRoomUser,
  type Room,
  type RoomBlockedUser,
  type RoomMember,
  type RoomPreview,
} from '@/services/rooms-service'
import { useCurrentUserStore } from '@/stores/current-user-store'

export type RoomScreen = 'loading' | 'not-found' | 'load-error' | 'blocked' | 'invitation' | 'room'

export const useRoomStore = defineStore('room', () => {
  const currentUserStore = useCurrentUserStore()

  const requestedRoomId = ref<string>()
  const roomPreview = ref<RoomPreview>()
  const room = ref<Room>()
  const roomMembers = ref<RoomMember[]>([])
  const roomBlockedUsers = ref<RoomBlockedUser[]>([])
  const isLoadingRoom = ref(false)
  const isRoomMissing = ref(false)
  const loadErrorMessage = ref<string>()

  const canManageRoom = computed(
    () =>
      room.value !== undefined &&
      (room.value.ownerId === currentUserStore.currentUser?.id || currentUserStore.isAdmin),
  )
  const isRoomOwner = computed(() => room.value?.ownerId === currentUserStore.currentUser?.id)
  const isRoomMember = computed(() =>
    roomMembers.value.some((roomMember) => roomMember.userId === currentUserStore.currentUser?.id),
  )
  const visibleRoomScreen = computed<RoomScreen>(() => {
    if (isRoomMissing.value) {
      return 'not-found'
    }
    if (loadErrorMessage.value) {
      return 'load-error'
    }
    if (room.value) {
      return 'room'
    }
    if (roomPreview.value?.isBlocked) {
      return 'blocked'
    }
    if (roomPreview.value) {
      return 'invitation'
    }
    return 'loading'
  })

  function resetRoom(roomId: string) {
    requestedRoomId.value = roomId
    roomPreview.value = undefined
    room.value = undefined
    roomMembers.value = []
    roomBlockedUsers.value = []
    isRoomMissing.value = false
    loadErrorMessage.value = undefined
  }

  async function loadRoomContents(roomId: string) {
    const [loadedRoom, loadedMembers] = await Promise.all([
      fetchRoom(roomId),
      fetchRoomMembers(roomId),
    ])
    if (requestedRoomId.value !== roomId) {
      return
    }
    room.value = loadedRoom
    roomMembers.value = loadedMembers
    isRoomMissing.value = loadedRoom === undefined
    if (canManageRoom.value) {
      await loadRoomBlockedUsers(roomId)
    }
  }

  async function loadRoomBlockedUsers(roomId: string) {
    const loadedBlockedUsers = await fetchRoomBlockedUsers(roomId)
    if (requestedRoomId.value === roomId) {
      roomBlockedUsers.value = loadedBlockedUsers
    }
  }

  async function loadRoom(roomId: string) {
    if (requestedRoomId.value !== roomId) {
      resetRoom(roomId)
    }
    if (!isValidRoomId(roomId)) {
      isRoomMissing.value = true
      return
    }
    isLoadingRoom.value = true
    loadErrorMessage.value = undefined
    try {
      const loadedPreview = await fetchRoomPreview(roomId)
      if (requestedRoomId.value !== roomId) {
        return
      }
      roomPreview.value = loadedPreview
      if (!loadedPreview) {
        isRoomMissing.value = true
        return
      }
      if (loadedPreview.isMember || currentUserStore.isAdmin) {
        await loadRoomContents(roomId)
      }
    } catch (loadError) {
      loadErrorMessage.value = describeError(loadError, 'Could not load this room')
    } finally {
      isLoadingRoom.value = false
    }
  }

  async function reloadRequestedRoomMembers() {
    const roomId = requestedRoomId.value
    if (!roomId || !room.value) {
      return
    }
    const loadedMembers = await fetchRoomMembers(roomId)
    if (requestedRoomId.value === roomId) {
      roomMembers.value = loadedMembers
    }
  }

  async function joinRequestedRoom() {
    if (!requestedRoomId.value) {
      return
    }
    await joinRoom(requestedRoomId.value)
    await loadRoomContents(requestedRoomId.value)
  }

  async function leaveRequestedRoom() {
    if (requestedRoomId.value) {
      await leaveRoom(requestedRoomId.value)
    }
  }

  async function renameRequestedRoom(newName: string) {
    if (requestedRoomId.value) {
      room.value = await renameRoom(requestedRoomId.value, newName)
    }
  }

  async function removeMemberFromRequestedRoom(memberUserId: string) {
    if (!requestedRoomId.value) {
      return
    }
    await removeRoomMember(requestedRoomId.value, memberUserId)
    roomMembers.value = roomMembers.value.filter((roomMember) => roomMember.userId !== memberUserId)
    await loadRoomBlockedUsers(requestedRoomId.value)
  }

  async function unblockUserFromRequestedRoom(blockedUserId: string) {
    if (!requestedRoomId.value) {
      return
    }
    await unblockRoomUser(requestedRoomId.value, blockedUserId)
    roomBlockedUsers.value = roomBlockedUsers.value.filter(
      (roomBlockedUser) => roomBlockedUser.userId !== blockedUserId,
    )
  }

  return {
    roomPreview,
    room,
    roomMembers,
    roomBlockedUsers,
    isLoadingRoom,
    loadErrorMessage,
    canManageRoom,
    isRoomOwner,
    isRoomMember,
    visibleRoomScreen,
    loadRoom,
    reloadRequestedRoomMembers,
    joinRequestedRoom,
    leaveRequestedRoom,
    renameRequestedRoom,
    removeMemberFromRequestedRoom,
    unblockUserFromRequestedRoom,
  }
})
