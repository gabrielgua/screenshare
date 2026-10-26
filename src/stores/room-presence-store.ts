import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  closeRoomPresenceChannel,
  openRoomPresenceChannel,
  readPresentRoomUsers,
  type PresentRoomUser,
} from '@/services/room-presence-service'
import { useCurrentUserStore } from '@/stores/current-user-store'

export type RoomKickReason = 'kicked' | 'blocked'

export interface RoomKickNotice {
  roomId: string
  reason: RoomKickReason
  receivedAt: number
}

interface RoomKickPayload {
  userId?: string
  reason?: RoomKickReason
}

interface RoomPresenceSubscription {
  watcherCount: number
  channel?: RealtimeChannel
  isSubscribed: boolean
  ownPresence?: PresentRoomUser
}

export const useRoomPresenceStore = defineStore('room-presence', () => {
  const currentUserStore = useCurrentUserStore()

  const presentUsersByRoomId = ref<Record<string, PresentRoomUser[]>>({})
  const subscriptionsByRoomId = new Map<string, RoomPresenceSubscription>()
  const latestKickNotice = ref<RoomKickNotice>()

  function updatePresentUsers(roomId: string, presentUsers: PresentRoomUser[]) {
    presentUsersByRoomId.value = { ...presentUsersByRoomId.value, [roomId]: presentUsers }
  }

  function forgetPresentUsers(roomId: string) {
    presentUsersByRoomId.value = Object.fromEntries(
      Object.entries(presentUsersByRoomId.value).filter(([knownRoomId]) => knownRoomId !== roomId),
    )
  }

  async function connectToRoomPresence(roomId: string, subscription: RoomPresenceSubscription) {
    const currentUserId = currentUserStore.currentUser?.id
    if (!currentUserId) {
      return
    }
    const channel = await openRoomPresenceChannel(roomId, currentUserId)
    if (subscriptionsByRoomId.get(roomId) !== subscription) {
      closeRoomPresenceChannel(channel)
      return
    }
    subscription.channel = channel
    channel.on('presence', { event: 'sync' }, () => {
      updatePresentUsers(roomId, readPresentRoomUsers(channel))
    })
    channel.on('broadcast', { event: 'room-member-kicked' }, ({ payload }) => {
      const kickPayload = payload as RoomKickPayload
      if (kickPayload.userId && kickPayload.userId === currentUserStore.currentUser?.id) {
        latestKickNotice.value = {
          roomId,
          reason: kickPayload.reason ?? 'kicked',
          receivedAt: Date.now(),
        }
      }
    })
    channel.subscribe((subscriptionStatus) => {
      subscription.isSubscribed = subscriptionStatus === 'SUBSCRIBED'
      if (subscription.isSubscribed && subscription.ownPresence) {
        void channel.track(subscription.ownPresence)
      }
    })
  }

  function watchRoomPresence(roomId: string) {
    const existingSubscription = subscriptionsByRoomId.get(roomId)
    if (existingSubscription) {
      existingSubscription.watcherCount += 1
      return
    }
    const newSubscription: RoomPresenceSubscription = { watcherCount: 1, isSubscribed: false }
    subscriptionsByRoomId.set(roomId, newSubscription)
    void connectToRoomPresence(roomId, newSubscription)
  }

  function stopWatchingRoomPresence(roomId: string) {
    const subscription = subscriptionsByRoomId.get(roomId)
    if (!subscription) {
      return
    }
    subscription.watcherCount -= 1
    if (subscription.watcherCount > 0) {
      return
    }
    subscriptionsByRoomId.delete(roomId)
    if (subscription.channel) {
      closeRoomPresenceChannel(subscription.channel)
    }
    forgetPresentUsers(roomId)
  }

  function shareOwnPresence(roomId: string) {
    const subscription = subscriptionsByRoomId.get(roomId)
    const currentUser = currentUserStore.currentUser
    if (!subscription || !currentUser) {
      return
    }
    subscription.ownPresence = {
      userId: currentUser.id,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatarUrl,
      arrivedAt: new Date().toISOString(),
    }
    if (subscription.isSubscribed && subscription.channel) {
      void subscription.channel.track(subscription.ownPresence)
    }
  }

  function updateOwnPresence(roomId: string, presenceChanges: Partial<PresentRoomUser>) {
    const subscription = subscriptionsByRoomId.get(roomId)
    if (!subscription?.ownPresence) {
      return
    }
    subscription.ownPresence = { ...subscription.ownPresence, ...presenceChanges }
    if (subscription.isSubscribed && subscription.channel) {
      void subscription.channel.track(subscription.ownPresence)
    }
  }

  function stopSharingOwnPresence(roomId: string) {
    const subscription = subscriptionsByRoomId.get(roomId)
    if (!subscription?.ownPresence) {
      return
    }
    subscription.ownPresence = undefined
    if (subscription.isSubscribed && subscription.channel) {
      void subscription.channel.untrack()
    }
  }

  return {
    presentUsersByRoomId,
    latestKickNotice,
    watchRoomPresence,
    stopWatchingRoomPresence,
    shareOwnPresence,
    updateOwnPresence,
    stopSharingOwnPresence,
  }
})
