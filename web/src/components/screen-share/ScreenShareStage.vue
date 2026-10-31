<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import { useStageFullscreen } from '@/composables/use-stage-fullscreen'
import { useScreenShareStore } from '@/stores/screen-share-store'
import ScreenShareEmptyState from './ScreenShareEmptyState.vue'
import ScreenShareTile from './ScreenShareTile.vue'

interface ScreenShareStageProps {
  screenShares: RoomScreenShare[]
}

const props = defineProps<ScreenShareStageProps>()

const screenShareStore = useScreenShareStore()
const {
  stageElement,
  focusedShareAspectRatio,
  isFullscreen: isStageFullscreen,
  isFillingWindow,
  isShareWiderThanTall,
  enterFullscreen,
  exitFullscreen,
  toggleFullscreen,
} = useStageFullscreen()

const focusedScreenShare = computed(
  () =>
    props.screenShares.find(
      (screenShare) => screenShare.userId === screenShareStore.focusedUserId,
    ) ?? props.screenShares[0],
)
const otherScreenShares = computed(() =>
  props.screenShares.filter((screenShare) => screenShare !== focusedScreenShare.value),
)
const isShowingFocusLayout = computed(
  () => isStageFullscreen.value || screenShareStore.layout === 'focus',
)
const isFillingStageArea = computed(() => props.screenShares.length > 1)
const stageSizeClasses = computed(() => {
  if (isFillingWindow.value) {
    return isShareWiderThanTall.value ? 'window-filling-stage-rotated' : 'window-filling-stage'
  }
  return isFillingStageArea.value
    ? 'relative size-full'
    : 'video-fit-frame relative lg:aspect-auto lg:size-full'
})
const fullscreenThumbnailClasses = computed(() =>
  screenShareStore.touchControlsUserId
    ? 'opacity-100'
    : 'pointer-events-none opacity-0 group-hover/stage:pointer-events-auto group-hover/stage:opacity-100',
)
const gridClasses = computed(() => {
  const shareCount = props.screenShares.length
  if (shareCount <= 1) {
    return 'grid-cols-1'
  }
  if (shareCount <= 4) {
    return 'grid-cols-1 sm:grid-cols-2'
  }
  if (shareCount <= 9) {
    return 'grid-cols-2 lg:grid-cols-3'
  }
  return 'grid-cols-2 lg:grid-cols-4'
})

watch(
  () => props.screenShares.length,
  (shareCount) => {
    if (shareCount === 0 && isStageFullscreen.value) {
      void exitFullscreen()
    }
  },
)

function handleFocusRequested(userId: string) {
  screenShareStore.focusShare(userId)
}

function handleFocusToggleRequested(userId: string) {
  if (screenShareStore.layout === 'focus' && focusedScreenShare.value?.userId === userId) {
    screenShareStore.showSharesSideBySide()
    return
  }
  screenShareStore.focusShare(userId)
}

function handleFocusedVideoAspectRatioChanged(aspectRatio: number) {
  focusedShareAspectRatio.value = aspectRatio
}

async function handleFullscreenToggleRequested(userId: string) {
  if (!isStageFullscreen.value) {
    screenShareStore.focusShare(userId)
  }
  await toggleFullscreen()
}

onBeforeUnmount(() => {
  void exitFullscreen()
})
</script>

<template>
  <div
    class="grid min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-1 place-items-center"
    :class="{ 'stage-fit-area': !isFillingWindow }"
  >
    <div
      ref="stageElement"
      class="group/stage"
      :class="[stageSizeClasses, { 'bg-neutral-950': isStageFullscreen }]"
    >
      <ScreenShareEmptyState v-if="screenShares.length === 0" />
      <div
        v-else-if="isShowingFocusLayout && focusedScreenShare"
        class="flex size-full flex-col gap-3 short-landscape:gap-2"
      >
        <div class="min-h-0 flex-1">
          <ScreenShareTile
            :key="focusedScreenShare.userId"
            :screen-share="focusedScreenShare"
            is-focused
            :is-fullscreen="isStageFullscreen"
            @video-aspect-ratio-changed="handleFocusedVideoAspectRatioChanged"
            @focus-toggle-requested="handleFocusToggleRequested(focusedScreenShare.userId)"
            @fullscreen-toggle-requested="
              handleFullscreenToggleRequested(focusedScreenShare.userId)
            "
          />
        </div>
        <ul
          v-if="otherScreenShares.length > 0"
          class="scrollbar-thin-on-hover flex h-20 shrink-0 gap-2 overflow-x-auto sm:h-28 short-landscape:h-16"
          :class="
            isStageFullscreen && [
              'absolute inset-x-4 bottom-16 transition-opacity duration-200 motion-reduce:transition-none',
              fullscreenThumbnailClasses,
            ]
          "
          aria-label="Other shared screens"
        >
          <li
            v-for="screenShare in otherScreenShares"
            :key="screenShare.userId"
            class="aspect-video h-full shrink-0"
          >
            <ScreenShareTile
              :screen-share="screenShare"
              role="thumbnail"
              @focus-requested="handleFocusRequested(screenShare.userId)"
            />
          </li>
        </ul>
      </div>
      <ul v-else class="grid size-full auto-rows-fr gap-3" :class="gridClasses">
        <li v-for="screenShare in screenShares" :key="screenShare.userId" class="min-h-0 min-w-0">
          <ScreenShareTile
            :screen-share="screenShare"
            @focus-requested="handleFocusRequested(screenShare.userId)"
            @focus-toggle-requested="handleFocusToggleRequested(screenShare.userId)"
            @fullscreen-toggle-requested="handleFullscreenToggleRequested(screenShare.userId)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
