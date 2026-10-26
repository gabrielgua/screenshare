import type { RoomSignalingMessage } from '@/media/room-signaling-messages'
import { supabaseClient } from '@/services/supabase-client'

export interface RoomSignalingConnection {
  sendMessage: (message: RoomSignalingMessage) => void
  close: () => void
}

const SIGNAL_EVENT_NAME = 'signal'

export async function openRoomSignalingChannel(
  roomId: string,
  onMessage: (message: RoomSignalingMessage) => void,
): Promise<RoomSignalingConnection> {
  await supabaseClient.realtime.setAuth()
  const channel = supabaseClient.channel(`room-signaling:${roomId}`, {
    config: { private: true, broadcast: { self: false, ack: false } },
  })
  channel.on('broadcast', { event: SIGNAL_EVENT_NAME }, ({ payload }) => {
    onMessage(payload as RoomSignalingMessage)
  })
  await new Promise<void>((resolve, reject) => {
    channel.subscribe((subscriptionStatus, subscriptionError) => {
      if (subscriptionStatus === 'SUBSCRIBED') {
        resolve()
      }
      if (subscriptionStatus === 'CHANNEL_ERROR' || subscriptionStatus === 'TIMED_OUT') {
        reject(subscriptionError ?? new Error('Could not connect to the room'))
      }
    })
  })
  return {
    sendMessage: (message) => {
      void channel.send({ type: 'broadcast', event: SIGNAL_EVENT_NAME, payload: message })
    },
    close: () => {
      void supabaseClient.removeChannel(channel)
    },
  }
}
