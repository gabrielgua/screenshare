import { toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useRouter } from 'vue-router'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { useActiveRoomStore } from '@/stores/active-room-store'
import { useMiniplayerStore } from '@/stores/miniplayer-store'
import { useRoomPresenceStore, type RoomKickReason } from '@/stores/room-presence-store'

interface RoomKickMessage {
  title: (roomName: string) => string
  message: string
}

const kickMessageByReason: Record<RoomKickReason, RoomKickMessage> = {
  kicked: {
    title: (roomName) => `You were kicked from ${roomName}`,
    message: 'A room manager sent you out. You are still a member and can come back.',
  },
  blocked: {
    title: (roomName) => `You were removed from ${roomName}`,
    message: 'A room manager blocked you. You cannot join again unless they unblock you.',
  },
}

export function useRoomKickRedirect(
  roomId: MaybeRefOrGetter<string | undefined>,
  roomName: MaybeRefOrGetter<string | undefined>,
) {
  const router = useRouter()
  const roomPresenceStore = useRoomPresenceStore()
  const actionFeedbackStore = useActionFeedbackStore()
  const activeRoomStore = useActiveRoomStore()
  const miniplayerStore = useMiniplayerStore()

  watch(
    () => roomPresenceStore.latestKickNotice,
    (kickNotice) => {
      if (!kickNotice || kickNotice.roomId !== toValue(roomId)) {
        return
      }
      const kickMessage = kickMessageByReason[kickNotice.reason]
      const kickedRoomName = toValue(roomName) ?? 'the room'
      miniplayerStore.close()
      activeRoomStore.leaveRoom()
      router.push({ name: 'home' })
      actionFeedbackStore.showErrorFeedback(
        kickMessage.title(kickedRoomName),
        kickMessage.message,
        { shouldAutoClose: false },
      )
    },
  )
}
