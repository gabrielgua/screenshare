import type { RealtimeChannel } from '@supabase/supabase-js'
import { readSharedSurface, type SharedSurface } from '@/media/shared-surface'
import { supabaseClient } from '@/services/supabase-client'

export interface PresentRoomUser {
  userId: string
  displayName: string
  avatarUrl?: string
  arrivedAt: string
  isSharingScreen?: boolean
  sharedSurface?: SharedSurface
}

function buildRoomPresenceTopic(roomId: string): string {
  return `room-presence:${roomId}`
}

export async function openRoomPresenceChannel(
  roomId: string,
  presenceKey: string,
): Promise<RealtimeChannel> {
  await supabaseClient.realtime.setAuth()
  return supabaseClient.channel(buildRoomPresenceTopic(roomId), {
    config: { private: true, presence: { key: presenceKey } },
  })
}

export function closeRoomPresenceChannel(channel: RealtimeChannel) {
  void supabaseClient.removeChannel(channel)
}

export function readPresentRoomUsers(channel: RealtimeChannel): PresentRoomUser[] {
  const presenceState = channel.presenceState<PresentRoomUser>()
  return Object.values(presenceState)
    .map((presencesOfOneUser) => presencesOfOneUser[0])
    .filter((presentRoomUser): presentRoomUser is NonNullable<typeof presentRoomUser> =>
      Boolean(presentRoomUser?.userId),
    )
    .map(({ userId, displayName, avatarUrl, arrivedAt, isSharingScreen, sharedSurface }) => ({
      userId,
      displayName,
      avatarUrl,
      arrivedAt,
      isSharingScreen: isSharingScreen === true,
      sharedSurface: isSharingScreen === true ? readSharedSurface(sharedSurface) : undefined,
    }))
    .sort((firstUser, secondUser) => firstUser.arrivedAt.localeCompare(secondUser.arrivedAt))
}
