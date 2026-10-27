import { computed, onScopeDispose, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { PresentRoomUser } from '@/services/room-presence-service'
import { useRoomPresenceStore } from '@/stores/room-presence-store'

export function useRoomsPresence(roomIds: MaybeRefOrGetter<string[]>) {
  const roomPresenceStore = useRoomPresenceStore()
  const watchedRoomIds = new Set<string>()

  watch(
    () => toValue(roomIds),
    (nextRoomIds) => {
      const nextRoomIdSet = new Set(nextRoomIds)
      for (const watchedRoomId of [...watchedRoomIds]) {
        if (!nextRoomIdSet.has(watchedRoomId)) {
          roomPresenceStore.stopWatchingRoomPresence(watchedRoomId)
          watchedRoomIds.delete(watchedRoomId)
        }
      }
      for (const nextRoomId of nextRoomIdSet) {
        if (!watchedRoomIds.has(nextRoomId)) {
          roomPresenceStore.watchRoomPresence(nextRoomId)
          watchedRoomIds.add(nextRoomId)
        }
      }
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    watchedRoomIds.forEach((watchedRoomId) =>
      roomPresenceStore.stopWatchingRoomPresence(watchedRoomId),
    )
    watchedRoomIds.clear()
  })

  function readPresentUsers(roomId: string): PresentRoomUser[] {
    return roomPresenceStore.presentUsersByRoomId[roomId] ?? []
  }

  const presentUserCount = computed(() =>
    toValue(roomIds).reduce((total, roomId) => total + readPresentUsers(roomId).length, 0),
  )

  return { readPresentUsers, presentUserCount }
}
