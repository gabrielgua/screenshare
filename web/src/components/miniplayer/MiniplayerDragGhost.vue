<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import ScreenShareVideo from '@/components/screen-share/ScreenShareVideo.vue'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import { openDragGhostWindow, type DragGhostWindow } from '@/media/miniplayer-window'
import { useMiniplayerStore } from '@/stores/miniplayer-store'

interface MiniplayerDragGhostProps {
  screenSharesByUserId: Map<string, RoomScreenShare>
}

const props = defineProps<MiniplayerDragGhostProps>()

const miniplayerStore = useMiniplayerStore()
const ghostWindow = shallowRef<DragGhostWindow>()
let isOpeningGhostWindow = false

const draggedStream = computed(() => {
  const draggedUserId = miniplayerStore.dragGhost?.userId
  return draggedUserId ? props.screenSharesByUserId.get(draggedUserId)?.stream : undefined
})

function closeGhostWindow() {
  ghostWindow.value?.close()
  ghostWindow.value = undefined
}

async function showGhostWindow() {
  const placement = miniplayerStore.dragGhost
  if (!placement || isOpeningGhostWindow) {
    return
  }
  if (ghostWindow.value) {
    ghostWindow.value.moveTo(placement)
    return
  }
  isOpeningGhostWindow = true
  const openedGhostWindow = await openDragGhostWindow(placement)
  isOpeningGhostWindow = false
  if (!miniplayerStore.dragGhost) {
    openedGhostWindow?.close()
    return
  }
  ghostWindow.value = openedGhostWindow
  openedGhostWindow?.moveTo(miniplayerStore.dragGhost)
}

watch(
  () => miniplayerStore.dragGhost,
  (placement) => {
    if (placement) {
      void showGhostWindow()
      return
    }
    closeGhostWindow()
  },
)

onBeforeUnmount(closeGhostWindow)
</script>

<template>
  <Teleport v-if="ghostWindow" :to="ghostWindow.mountElement">
    <div
      class="size-full overflow-hidden bg-neutral-950 opacity-50 outline-2 -outline-offset-2 outline-brand-500 outline-dashed"
    >
      <ScreenShareVideo v-if="draggedStream" :stream="draggedStream" is-muted />
    </div>
  </Teleport>
</template>
