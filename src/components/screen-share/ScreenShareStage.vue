<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFullscreen } from '@vueuse/core'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import { useScreenShareStore } from '@/stores/screen-share-store'
import ScreenShareEmptyState from './ScreenShareEmptyState.vue'
import ScreenShareTile from './ScreenShareTile.vue'

interface ScreenShareStageProps {
  screenShares: RoomScreenShare[]
}

const props = defineProps<ScreenShareStageProps>()

const screenShareStore = useScreenShareStore()
const stageElement = ref<HTMLElement>()
const {
  isFullscreen: isStageFullscreen,
  enter: enterStageFullscreen,
  exit: exitStageFullscreen,
} = useFullscreen(stageElement)

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
      void exitStageFullscreen()
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

async function handleFullscreenToggleRequested(userId: string) {
  if (isStageFullscreen.value) {
    await exitStageFullscreen()
    return
  }
  screenShareStore.focusShare(userId)
  await enterStageFullscreen()
}
</script>

<template>
  <div class="stage-fit-area grid min-h-0 min-w-0 flex-1 place-items-center">
    <div
      ref="stageElement"
      class="group/stage video-fit-frame relative lg:aspect-auto lg:size-full"
      :class="{ 'bg-neutral-950': isStageFullscreen }"
    >
      <ScreenShareEmptyState v-if="screenShares.length === 0" />
      <div
        v-else-if="isShowingFocusLayout && focusedScreenShare"
        class="flex size-full flex-col gap-3"
      >
        <div class="min-h-0 flex-1">
          <ScreenShareTile
            :key="focusedScreenShare.userId"
            :screen-share="focusedScreenShare"
            is-focused
            :is-fullscreen="isStageFullscreen"
            @focus-toggle-requested="handleFocusToggleRequested(focusedScreenShare.userId)"
            @fullscreen-toggle-requested="
              handleFullscreenToggleRequested(focusedScreenShare.userId)
            "
          />
        </div>
        <ul
          v-if="otherScreenShares.length > 0"
          class="scrollbar-thin-on-hover flex h-20 shrink-0 gap-2 overflow-x-auto sm:h-28"
          :class="{
            'absolute inset-x-4 bottom-16 opacity-0 transition-opacity duration-200 group-hover/stage:opacity-100 motion-reduce:transition-none':
              isStageFullscreen,
          }"
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
