import { computed, onScopeDispose, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import type { PresentRoomUser } from '@/services/room-presence-service'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { useRoomPresenceStore } from '@/stores/room-presence-store'
import { useScreenShareStore } from '@/stores/screen-share-store'

export interface RoomScreenShare {
  userId: string
  displayName: string
  avatarUrl?: string
  stream?: MediaStream
  isOwnShare: boolean
}

export function useRoomScreenSharing(
  presentUsers: Ref<PresentRoomUser[]>,
  roomId: MaybeRefOrGetter<string | undefined>,
) {
  const currentUserStore = useCurrentUserStore()
  const roomPresenceStore = useRoomPresenceStore()
  const screenShareStore = useScreenShareStore()

  watch(
    () => [toValue(roomId), currentUserStore.currentUser?.id] as const,
    ([connectingRoomId, currentUserId]) => {
      if (connectingRoomId && currentUserId) {
        screenShareStore.connectToRoom(connectingRoomId, currentUserId).catch(() => {
          screenShareStore.disconnectFromRoom()
        })
        return
      }
      screenShareStore.disconnectFromRoom()
    },
    { immediate: true },
  )

  watch(
    presentUsers,
    (currentPresentUsers) => {
      screenShareStore.syncPresentUsers(
        currentPresentUsers.map((presentUser) => presentUser.userId),
      )
    },
    { immediate: true },
  )

  watch(
    () => screenShareStore.isSharingScreen,
    (isSharingScreen) => {
      const sharingRoomId = toValue(roomId)
      if (sharingRoomId) {
        roomPresenceStore.updateOwnPresence(sharingRoomId, { isSharingScreen })
      }
    },
  )

  onScopeDispose(() => screenShareStore.disconnectFromRoom())

  const screenShares = computed<RoomScreenShare[]>(() => {
    const currentUserId = currentUserStore.currentUser?.id
    return presentUsers.value.flatMap((presentUser): RoomScreenShare[] => {
      const isOwnShare = presentUser.userId === currentUserId
      const stream = isOwnShare
        ? screenShareStore.localStream
        : screenShareStore.remoteStreamsByUserId[presentUser.userId]
      const isSharing = isOwnShare
        ? screenShareStore.isSharingScreen && !screenShareStore.isOwnShareHidden
        : Boolean(stream) || presentUser.isSharingScreen === true
      if (!isSharing) {
        return []
      }
      return [
        {
          userId: presentUser.userId,
          displayName: presentUser.displayName,
          avatarUrl: presentUser.avatarUrl,
          stream,
          isOwnShare,
        },
      ]
    })
  })

  return { screenShares }
}
