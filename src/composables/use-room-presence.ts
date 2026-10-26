import { computed, onScopeDispose, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useRoomPresenceStore } from '@/stores/room-presence-store'

export function useRoomPresence(
  roomId: MaybeRefOrGetter<string | undefined>,
  shouldShareOwnPresence: MaybeRefOrGetter<boolean> = false,
) {
  const roomPresenceStore = useRoomPresenceStore()

  let watchedRoomId: string | undefined
  let isSharingOwnPresence = false

  function stopSharingIfNeeded() {
    if (watchedRoomId && isSharingOwnPresence) {
      roomPresenceStore.stopSharingOwnPresence(watchedRoomId)
    }
    isSharingOwnPresence = false
  }

  function stopWatchingIfNeeded() {
    stopSharingIfNeeded()
    if (watchedRoomId) {
      roomPresenceStore.stopWatchingRoomPresence(watchedRoomId)
    }
    watchedRoomId = undefined
  }

  watch(
    () => [toValue(roomId), toValue(shouldShareOwnPresence)] as const,
    ([nextRoomId, shouldShare]) => {
      if (nextRoomId !== watchedRoomId) {
        stopWatchingIfNeeded()
        if (nextRoomId) {
          roomPresenceStore.watchRoomPresence(nextRoomId)
          watchedRoomId = nextRoomId
        }
      }
      if (!shouldShare) {
        stopSharingIfNeeded()
        return
      }
      if (watchedRoomId && !isSharingOwnPresence) {
        roomPresenceStore.shareOwnPresence(watchedRoomId)
        isSharingOwnPresence = true
      }
    },
    { immediate: true },
  )

  onScopeDispose(stopWatchingIfNeeded)

  const presentUsers = computed(() => {
    const currentRoomId = toValue(roomId)
    return currentRoomId ? (roomPresenceStore.presentUsersByRoomId[currentRoomId] ?? []) : []
  })

  return { presentUsers }
}
