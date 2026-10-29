<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import { useMiniplayerTileDragging } from '@/composables/use-miniplayer-tile-dragging'
import { canSeparateMiniplayers, placeBesideWindow } from '@/media/miniplayer-window'
import { useMiniplayerStore, type MiniplayerDropEdge } from '@/stores/miniplayer-store'
import MiniplayerTile from './MiniplayerTile.vue'

interface MiniplayerPanelProps {
  groupId: string
  shareRows: RoomScreenShare[][]
}

interface TilePlacement {
  screenShare: RoomScreenShare
  left: string
  top: string
  width: string
  height: string
}

const props = defineProps<MiniplayerPanelProps>()

const miniplayerStore = useMiniplayerStore()
const panelElement = ref<HTMLElement>()

const shareCount = computed(() => props.shareRows.flat().length)
const isAloneInWindow = computed(() => shareCount.value === 1)
const canMoveShares = computed(() => !isAloneInWindow.value || canSeparateMiniplayers())
const canUnpinShares = computed(() => !isAloneInWindow.value && canSeparateMiniplayers())

const dropStripClassesByEdge: Record<MiniplayerDropEdge, string> = {
  left: 'pl-3',
  right: 'pr-3',
  top: 'pt-3',
  bottom: 'pb-3',
}

const {
  handleTilePointerDown,
  handleTilePointerMove,
  handleTilePointerUp,
  handleTilePointerCancel,
} = useMiniplayerTileDragging(
  panelElement,
  () => props.groupId,
  () => isAloneInWindow.value,
)

function toPercentage(fraction: number): string {
  return `${fraction * 100}%`
}

const columnCount = computed(() =>
  Math.max(1, ...props.shareRows.map((shareRow) => shareRow.length)),
)

const tilePlacements = computed<TilePlacement[]>(() =>
  props.shareRows.flatMap((shareRow, rowIndex) => {
    const rowCenteringOffset = (columnCount.value - shareRow.length) / 2
    return shareRow.map((screenShare, columnIndex) => ({
      screenShare,
      left: toPercentage((rowCenteringOffset + columnIndex) / columnCount.value),
      top: toPercentage(rowIndex / props.shareRows.length),
      width: toPercentage(1 / columnCount.value),
      height: toPercentage(1 / props.shareRows.length),
    }))
  }),
)

function isDraggedInsideWindow(userId: string): boolean {
  return miniplayerStore.draggedUserId === userId && !isAloneInWindow.value
}

function describeTileClasses(userId: string) {
  if (isDraggedInsideWindow(userId)) {
    return 'z-20 opacity-50 outline-2 -outline-offset-2 outline-brand-500 outline-dashed transition-opacity duration-150'
  }
  const dropTarget = miniplayerStore.dropTarget
  const dropStripClasses =
    dropTarget?.userId === userId ? ['bg-brand-500', dropStripClassesByEdge[dropTarget.edge]] : ''
  return [
    'z-0 transition-all duration-500 ease-bounce motion-reduce:transition-none',
    dropStripClasses,
  ]
}

function handleUnpinRequested(userId: string) {
  const view = panelElement.value?.ownerDocument.defaultView
  const tileElement = panelElement.value?.querySelector<HTMLElement>(
    `[data-miniplayer-user-id="${userId}"]`,
  )
  if (!view || !tileElement) {
    return
  }
  const newWindowWidth = tileElement.offsetWidth + view.outerWidth - view.innerWidth
  miniplayerStore.unpinShare(userId, {
    left: placeBesideWindow(view, newWindowWidth),
    top: view.screenY,
    tileWidth: tileElement.offsetWidth,
  })
}
</script>

<template>
  <div ref="panelElement" class="relative size-full bg-neutral-950">
    <div class="relative size-full">
      <div
        v-for="placement in tilePlacements"
        :key="placement.screenShare.userId"
        :data-miniplayer-user-id="placement.screenShare.userId"
        class="absolute touch-none select-none starting:scale-90 starting:opacity-0"
        :class="describeTileClasses(placement.screenShare.userId)"
        :style="{
          left: placement.left,
          top: placement.top,
          width: placement.width,
          height: placement.height,
        }"
        @pointerdown="handleTilePointerDown(placement.screenShare.userId, $event)"
        @pointermove="handleTilePointerMove"
        @pointerup="handleTilePointerUp"
        @pointercancel="handleTilePointerCancel"
      >
        <MiniplayerTile
          :screen-share="placement.screenShare"
          :can-be-dragged="canMoveShares"
          :can-be-unpinned="canUnpinShares"
          :is-dragged="miniplayerStore.draggedUserId === placement.screenShare.userId"
          @unpin-requested="handleUnpinRequested(placement.screenShare.userId)"
        />
      </div>
    </div>
  </div>
</template>
