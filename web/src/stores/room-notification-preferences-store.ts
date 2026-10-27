import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useCurrentUserStore } from '@/stores/current-user-store'

export interface RoomNotificationPreferences {
  shouldShowToasts: boolean
  shouldPlaySounds: boolean
}

const INITIAL_ROOM_NOTIFICATION_PREFERENCES: RoomNotificationPreferences = {
  shouldShowToasts: true,
  shouldPlaySounds: true,
}

export const useRoomNotificationPreferencesStore = defineStore(
  'room-notification-preferences',
  () => {
    const currentUserStore = useCurrentUserStore()

    const roomNotificationPreferences = useLocalStorage<RoomNotificationPreferences>(
      () => `screenshare-room-notifications-${currentUserStore.currentUser?.id ?? 'signed-out'}`,
      INITIAL_ROOM_NOTIFICATION_PREFERENCES,
      { mergeDefaults: true },
    )

    const shouldShowToasts = computed({
      get: () => roomNotificationPreferences.value.shouldShowToasts,
      set: (shouldShow: boolean) => {
        roomNotificationPreferences.value = {
          ...roomNotificationPreferences.value,
          shouldShowToasts: shouldShow,
        }
      },
    })

    const shouldPlaySounds = computed({
      get: () => roomNotificationPreferences.value.shouldPlaySounds,
      set: (shouldPlay: boolean) => {
        roomNotificationPreferences.value = {
          ...roomNotificationPreferences.value,
          shouldPlaySounds: shouldPlay,
        }
      },
    })

    return { shouldShowToasts, shouldPlaySounds }
  },
)
