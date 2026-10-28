<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import {
  useMiniplayerTileDragging,
  type MiniplayerDropTarget,
} from '@/composables/use-miniplayer-tile-dragging'
import { useMiniplayerStore } from '@/stores/miniplayer-store'
import MiniplayerTile from './MiniplayerTile.vue'

interface MiniplayerPanelProps {
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

function handleTileDropped(userId: string, dropTarget: MiniplayerDropTarget) {
  miniplayerStore.moveShare(userId, dropTarget.userId, dropTarget.edge)
}

const {
  draggedUserId,
  dropTarget,
  handleTilePointerDown,
  handleTilePointerMove,
  handleTilePointerUp,
  handleTilePointerCancel,
} = useMiniplayerTileDragging(panelElement, handleTileDropped)

const canRearrange = computed(() => props.shareRows.flat().length > 1)

function toPercentage(fraction: number): string {
  return `${fraction * 100}%`
}

const tilePlacements = computed<TilePlacement[]>(() =>
  props.shareRows.flatMap((shareRow, rowIndex) =>
    shareRow.map((screenShare, columnIndex) => ({
      screenShare,
      left: toPercentage(columnIndex / shareRow.length),
      top: toPercentage(rowIndex / props.shareRows.length),
      width: toPercentage(1 / shareRow.length),
      height: toPercentage(1 / props.shareRows.length),
    })),
  ),
)
</script>

<template>
  <div ref="panelElement" class="relative size-full p-1">
    <div class="relative size-full">
      <div
        v-for="placement in tilePlacements"
        :key="placement.screenShare.userId"
        :data-miniplayer-user-id="placement.screenShare.userId"
        class="absolute touch-none p-1 select-none starting:scale-90 starting:opacity-0"
        :class="
          draggedUserId === placement.screenShare.userId
            ? 'z-20 transition-none'
            : 'z-0 transition-all duration-500 ease-bounce motion-reduce:transition-none'
        "
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
          :can-be-dragged="canRearrange"
          :is-dragged="draggedUserId === placement.screenShare.userId"
          :drop-edge="
            dropTarget?.userId === placement.screenShare.userId ? dropTarget.edge : undefined
          "
        />
      </div>
    </div>
  </div>
</template>
