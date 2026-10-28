<script setup lang="ts">
import { watch } from 'vue'
import MiniplayerHost from '@/components/miniplayer/MiniplayerHost.vue'
import { useRoomArrivalNotifications } from '@/composables/use-room-arrival-notifications'
import { useRoomKickRedirect } from '@/composables/use-room-kick-redirect'
import { useRoomPresence } from '@/composables/use-room-presence'
import { useRoomScreenSharing } from '@/composables/use-room-screen-sharing'
import { useActiveRoomStore, type ActiveRoom } from '@/stores/active-room-store'

interface ActiveRoomSessionProps {
  room: ActiveRoom
}

const props = defineProps<ActiveRoomSessionProps>()

const activeRoomStore = useActiveRoomStore()

const { presentUsers } = useRoomPresence(() => props.room.id, true)
useRoomArrivalNotifications(
  presentUsers,
  () => props.room.id,
  () => props.room.name,
)
const { screenShares } = useRoomScreenSharing(presentUsers, () => props.room.id)
useRoomKickRedirect(
  () => props.room.id,
  () => props.room.name,
)

watch(
  [presentUsers, screenShares],
  ([currentPresentUsers, currentScreenShares]) =>
    activeRoomStore.publishSessionState(currentPresentUsers, currentScreenShares),
  { immediate: true },
)
</script>

<template>
  <MiniplayerHost :room="room" :screen-shares="screenShares" />
</template>
