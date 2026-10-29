<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMiniplayerNativeWindowMoves } from '@/composables/use-miniplayer-native-window-moves'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import { useActiveRoomStore, type ActiveRoom } from '@/stores/active-room-store'
import { useMiniplayerStore } from '@/stores/miniplayer-store'
import MiniplayerDragGhost from './MiniplayerDragGhost.vue'
import MiniplayerGroupWindow from './MiniplayerGroupWindow.vue'

interface MiniplayerHostProps {
  room: ActiveRoom
  screenShares: RoomScreenShare[]
}

const props = defineProps<MiniplayerHostProps>()

const route = useRoute()
const miniplayerStore = useMiniplayerStore()
const activeRoomStore = useActiveRoomStore()

useMiniplayerNativeWindowMoves()

const screenSharesByUserId = computed(
  () => new Map(props.screenShares.map((screenShare) => [screenShare.userId, screenShare])),
)

function isViewingTheRoom(): boolean {
  return route.name === 'room' && route.params.roomId === props.room.id
}

watch(
  () => miniplayerStore.isOpen,
  (isOpen) => {
    if (!isOpen && !isViewingTheRoom()) {
      activeRoomStore.leaveRoom()
    }
  },
)

watch(
  () => props.screenShares.map((screenShare) => screenShare.userId),
  (availableUserIds) => miniplayerStore.keepOnlyShares(availableUserIds),
)

onBeforeUnmount(() => miniplayerStore.close())
</script>

<template>
  <MiniplayerGroupWindow
    v-for="group in miniplayerStore.groups"
    :key="group.id"
    :group="group"
    :room="room"
    :screen-shares-by-user-id="screenSharesByUserId"
  />
  <MiniplayerDragGhost :screen-shares-by-user-id="screenSharesByUserId" />
</template>
