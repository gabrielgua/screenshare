import { toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { playRoomArrivalSound, playRoomDepartureSound } from '@/audio/notification-sounds'
import type { PresentRoomUser } from '@/services/room-presence-service'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { useRoomNotificationPreferencesStore } from '@/stores/room-notification-preferences-store'
import { useToastStore } from '@/stores/toast-store'

export type RoomPresenceChange = 'arrival' | 'departure'

const PRESENCE_SETTLING_MILLISECONDS = 2000

export function useRoomArrivalNotifications(
  presentUsers: Ref<PresentRoomUser[]>,
  roomId: MaybeRefOrGetter<string | undefined>,
  roomName: MaybeRefOrGetter<string | undefined>,
) {
  const currentUserStore = useCurrentUserStore()
  const toastStore = useToastStore()
  const roomNotificationPreferencesStore = useRoomNotificationPreferencesStore()

  let knownPresentUsersById: Map<string, PresentRoomUser> | undefined
  let quietUntilTimestamp = 0

  function notifyAboutPresenceChange(change: RoomPresenceChange, presentUser: PresentRoomUser) {
    if (roomNotificationPreferencesStore.shouldShowToasts) {
      toastStore.showToast({
        title: `${presentUser.displayName} ${change === 'arrival' ? 'joined' : 'left'}`,
        description: toValue(roomName),
        tone: change === 'arrival' ? 'success' : 'neutral',
        person: { name: presentUser.displayName, imageUrl: presentUser.avatarUrl },
      })
    }
    if (roomNotificationPreferencesStore.shouldPlaySounds) {
      if (change === 'arrival') {
        playRoomArrivalSound()
      } else {
        playRoomDepartureSound()
      }
    }
  }

  watch(
    () => toValue(roomId),
    () => {
      knownPresentUsersById = undefined
    },
  )

  watch(presentUsers, (currentPresentUsers) => {
    const currentUserId = currentUserStore.currentUser?.id
    const currentPresentUsersById = new Map(
      currentPresentUsers.map((presentUser) => [presentUser.userId, presentUser]),
    )
    if (!knownPresentUsersById) {
      if (currentUserId && currentPresentUsersById.has(currentUserId)) {
        knownPresentUsersById = currentPresentUsersById
        quietUntilTimestamp = Date.now() + PRESENCE_SETTLING_MILLISECONDS
      }
      return
    }
    if (Date.now() < quietUntilTimestamp) {
      knownPresentUsersById = currentPresentUsersById
      return
    }
    const previouslyPresentUsersById = knownPresentUsersById
    knownPresentUsersById = currentPresentUsersById
    currentPresentUsers
      .filter(
        (presentUser) =>
          presentUser.userId !== currentUserId &&
          !previouslyPresentUsersById.has(presentUser.userId),
      )
      .forEach((arrivedUser) => notifyAboutPresenceChange('arrival', arrivedUser))
    ;[...previouslyPresentUsersById.values()]
      .filter(
        (presentUser) =>
          presentUser.userId !== currentUserId && !currentPresentUsersById.has(presentUser.userId),
      )
      .forEach((departedUser) => notifyAboutPresenceChange('departure', departedUser))
  })
}
