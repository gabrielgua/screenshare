import { computed, watch, type MaybeRefOrGetter } from 'vue'
import { useRoomPresence } from '@/composables/use-room-presence'
import { useRoomStore } from '@/stores/room-store'

export function useRequestedRoomPresence(
  shouldShareOwnPresence: MaybeRefOrGetter<boolean> = false,
) {
  const roomStore = useRoomStore()
  const { presentUsers } = useRoomPresence(() => roomStore.room?.id, shouldShareOwnPresence)

  const presentUserIds = computed(() => presentUsers.value.map((presentUser) => presentUser.userId))
  const userIdsThatTriggeredMemberReload = new Set<string>()

  watch(presentUserIds, (currentPresentUserIds) => {
    const unknownPresentUserIds = currentPresentUserIds.filter(
      (presentUserId) =>
        !userIdsThatTriggeredMemberReload.has(presentUserId) &&
        !roomStore.roomMembers.some((roomMember) => roomMember.userId === presentUserId),
    )
    if (unknownPresentUserIds.length === 0) {
      return
    }
    unknownPresentUserIds.forEach((unknownPresentUserId) =>
      userIdsThatTriggeredMemberReload.add(unknownPresentUserId),
    )
    void roomStore.reloadRequestedRoomMembers()
  })

  return { presentUsers, presentUserIds }
}
