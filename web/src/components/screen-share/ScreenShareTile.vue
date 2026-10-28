<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementSize, useMediaQuery, useTimeoutFn, watchDebounced } from '@vueuse/core'
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseSpinner from '@/components/icon/BaseSpinner.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import { THUMBNAIL_TILE_WIDTH_LIMIT } from '@/media/screen-share-quality'
import { FALLBACK_SHARE_ASPECT_RATIO } from '@/media/video-shape'
import { useScreenShareStore } from '@/stores/screen-share-store'
import ScreenShareTileControls from './ScreenShareTileControls.vue'
import FittedVideoFrame from './FittedVideoFrame.vue'
import ScreenShareVideo from './ScreenShareVideo.vue'

export type ScreenShareTileRole = 'stage' | 'thumbnail'

interface ScreenShareTileProps {
  screenShare: RoomScreenShare
  role?: ScreenShareTileRole
  isFocused?: boolean
  isFullscreen?: boolean
}

const props = withDefaults(defineProps<ScreenShareTileProps>(), {
  role: 'stage',
  isFocused: false,
  isFullscreen: false,
})

const emit = defineEmits<{
  focusRequested: []
  focusToggleRequested: []
  fullscreenToggleRequested: []
}>()

const VIEW_QUALITY_DEBOUNCE_MILLISECONDS = 400
const TOUCH_CONTROLS_VISIBLE_MILLISECONDS = 4000

const screenShareStore = useScreenShareStore()
const tileElement = ref<HTMLElement>()
const videoAspectRatio = ref(FALLBACK_SHARE_ASPECT_RATIO)
const { width: tileWidth } = useElementSize(tileElement)
const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')
const isShowingTouchControls = computed(
  () => props.role === 'stage' && screenShareStore.touchControlsUserId === props.screenShare.userId,
)
const { start: restartTouchControlsTimer, stop: stopTouchControlsTimer } = useTimeoutFn(
  () => screenShareStore.hideTouchControls(props.screenShare.userId),
  TOUCH_CONTROLS_VISIBLE_MILLISECONDS,
  { immediate: isShowingTouchControls.value },
)

const areControlsInteractive = computed(() => canHover.value || isShowingTouchControls.value)
const stageOverlayVisibilityClasses = computed(() =>
  isShowingTouchControls.value
    ? 'opacity-100'
    : 'opacity-0 group-hover/tile:opacity-100 group-focus-within/tile:opacity-100',
)

const shareAudio = computed(() => screenShareStore.readAudio(props.screenShare.userId))
const shareLabel = computed(() =>
  props.screenShare.isOwnShare ? 'You' : props.screenShare.displayName,
)

watchDebounced(
  [tileWidth, () => props.screenShare.stream],
  ([currentTileWidth, stream]) => {
    if (props.screenShare.isOwnShare || !stream || currentTileWidth === 0) {
      return
    }
    screenShareStore.requestRemoteViewQuality(
      props.screenShare.userId,
      currentTileWidth < THUMBNAIL_TILE_WIDTH_LIMIT ? 'thumbnail' : 'full',
    )
  },
  { debounce: VIEW_QUALITY_DEBOUNCE_MILLISECONDS, immediate: true },
)

function handleVideoAspectRatioChanged(aspectRatio: number) {
  videoAspectRatio.value = aspectRatio
}

function handleThumbnailClick() {
  emit('focusRequested')
}

function handleStageClick(clickEvent: MouseEvent) {
  if (canHover.value) {
    emit('focusToggleRequested')
    return
  }
  ;(clickEvent.currentTarget as HTMLElement).blur()
  if (isShowingTouchControls.value) {
    stopTouchControlsTimer()
    screenShareStore.hideTouchControls(props.screenShare.userId)
    return
  }
  screenShareStore.showTouchControls(props.screenShare.userId)
  restartTouchControlsTimer()
}

function handleControlsPointerDown() {
  if (isShowingTouchControls.value) {
    restartTouchControlsTimer()
  }
}

function handleFocusToggleRequested() {
  emit('focusToggleRequested')
}

function handleFullscreenToggleRequested() {
  emit('fullscreenToggleRequested')
}
</script>

<template>
  <article
    ref="tileElement"
    class="group/tile relative size-full overflow-hidden rounded-card bg-neutral-950 ring-2 transition-shadow duration-200"
    :class="isFocused && role === 'thumbnail' ? 'ring-brand-500' : 'ring-transparent'"
    :aria-label="`${shareLabel} screen`"
  >
    <FittedVideoFrame :aspect-ratio="videoAspectRatio">
      <ScreenShareVideo
        v-if="screenShare.stream"
        :stream="screenShare.stream"
        :volume="shareAudio.volume"
        :is-muted="screenShare.isOwnShare || shareAudio.isMuted"
        @aspect-ratio-changed="handleVideoAspectRatioChanged"
      />
      <div
        v-else
        class="flex size-full flex-col items-center justify-center gap-3 text-neutral-400"
      >
        <BaseAvatar
          :name="screenShare.displayName"
          :image-url="screenShare.avatarUrl"
          :size="role === 'thumbnail' ? 'sm' : 'lg'"
        />
        <div class="flex items-center gap-2">
          <BaseSpinner size="sm" />
          <BaseText v-if="role === 'stage'" as="span" size="sm" tone="inverse">
            Connecting to {{ screenShare.displayName }}
          </BaseText>
        </div>
      </div>
      <div
        class="dark pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 bg-linear-to-t from-neutral-950/80 to-transparent p-2"
        :class="
          role === 'thumbnail'
            ? 'pt-6'
            : [
                'pt-10 transition-opacity duration-200 motion-reduce:transition-none',
                stageOverlayVisibilityClasses,
              ]
        "
      >
        <div class="flex min-w-0 items-center gap-2 px-1 @max-3xs/video-frame:hidden">
          <BaseAvatar
            :name="screenShare.displayName"
            :image-url="screenShare.avatarUrl"
            size="sm"
            class="ring-2 ring-neutral-950/40"
          />
          <BaseText as="span" size="caption" weight="semibold" class="truncate">
            {{ shareLabel }}
          </BaseText>
        </div>
        <ScreenShareTileControls
          v-if="role === 'stage'"
          :screen-share="screenShare"
          :is-focused="isFocused"
          :is-fullscreen="isFullscreen"
          class="ml-auto min-w-0"
          :class="areControlsInteractive ? 'pointer-events-auto' : 'pointer-events-none'"
          @pointerdown="handleControlsPointerDown"
          @focus-toggle-requested="handleFocusToggleRequested"
          @fullscreen-toggle-requested="handleFullscreenToggleRequested"
        />
      </div>
    </FittedVideoFrame>
    <button
      v-if="role === 'stage' && !isFullscreen"
      type="button"
      :aria-label="
        canHover
          ? isFocused
            ? 'Show screens side by side'
            : `Focus ${shareLabel}'s screen`
          : `Show the controls for ${shareLabel}'s screen`
      "
      class="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500"
      @click="handleStageClick"
    />
    <button
      v-if="role === 'thumbnail'"
      type="button"
      :aria-label="`Focus ${shareLabel}'s screen`"
      class="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500"
      @click="handleThumbnailClick"
    />
  </article>
</template>
