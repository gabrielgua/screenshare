<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useEventListener, useTimeoutFn } from '@vueuse/core'
import { useColorScheme } from '@/composables/use-color-scheme'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import {
  countMiniplayerColumns,
  fitMiniplayerContent,
  measureTileWidth,
} from '@/media/miniplayer-layout'
import { openFloatingMiniplayerWindow, type MiniplayerWindow } from '@/media/miniplayer-window'
import { describeShareTitle } from '@/media/shared-surface'
import {
  registerMiniplayerView,
  unregisterMiniplayerView,
} from '@/media/miniplayer-window-registry'
import { FALLBACK_SHARE_ASPECT_RATIO } from '@/media/video-shape'
import type { ActiveRoom } from '@/stores/active-room-store'
import { useMiniplayerStore, type MiniplayerGroup } from '@/stores/miniplayer-store'
import InPageMiniplayer from './InPageMiniplayer.vue'
import MiniplayerPanel from './MiniplayerPanel.vue'
import MiniplayerWindowHeader from './MiniplayerWindowHeader.vue'

interface MiniplayerGroupWindowProps {
  group: MiniplayerGroup
  room: ActiveRoom
  screenSharesByUserId: Map<string, RoomScreenShare>
}

const props = defineProps<MiniplayerGroupWindowProps>()

const OPENING_TILE_WIDTH = 472
const MAXIMUM_OPENING_SIZE = { width: 1440, height: 820 }
const IN_PAGE_TILE_WIDTH = 376
const MAXIMUM_IN_PAGE_HEIGHT = 640
const IN_PAGE_WINDOW_MARGIN = 32
const OWN_RESIZE_SETTLING_MILLISECONDS = 1000

const miniplayerStore = useMiniplayerStore()
const { isDarkModeEnabled } = useColorScheme()

const floatingWindow = shallowRef<MiniplayerWindow>()
const isShowingInPage = ref(false)
let isUnmounted = false
let preferredTileWidth = props.group.openingPlacement?.tileWidth ?? OPENING_TILE_WIDTH
let ownResizeSettlesAt = 0

const shareRows = computed(() =>
  props.group.shareRows
    .map((userIds) =>
      userIds.flatMap((userId) => {
        const screenShare = props.screenSharesByUserId.get(userId)
        return screenShare ? [screenShare] : []
      }),
    )
    .filter((shareRow) => shareRow.length > 0),
)

const windowTitle = computed(() => {
  const [onlyShare, ...otherShares] = shareRows.value.flat()
  if (!onlyShare || otherShares.length > 0) {
    return props.room.name
  }
  return describeShareTitle(onlyShare.displayName, onlyShare.isOwnShare, onlyShare.sharedSurface)
})

const shareLayoutSignature = computed(() =>
  shareRows.value
    .map((shareRow) => shareRow.map((screenShare) => screenShare.userId).join(','))
    .join('|'),
)

function readShareAspectRatio(screenShare: RoomScreenShare): number {
  const playingVideo = floatingWindow.value?.document.querySelector<HTMLVideoElement>(
    `[data-miniplayer-user-id="${screenShare.userId}"] video`,
  )
  if (playingVideo?.videoWidth && playingVideo.videoHeight) {
    return playingVideo.videoWidth / playingVideo.videoHeight
  }
  const trackSettings = screenShare.stream?.getVideoTracks()[0]?.getSettings()
  if (trackSettings?.width && trackSettings.height) {
    return trackSettings.width / trackSettings.height
  }
  return FALLBACK_SHARE_ASPECT_RATIO
}

function readRowsOfAspectRatios(): number[][] {
  return shareRows.value.map((shareRow) => shareRow.map(readShareAspectRatio))
}

const columnCount = computed(() => countMiniplayerColumns(shareRows.value))

const inPageContentSize = computed(() =>
  fitMiniplayerContent(readRowsOfAspectRatios(), IN_PAGE_TILE_WIDTH, {
    width: window.innerWidth - IN_PAGE_WINDOW_MARGIN,
    height: MAXIMUM_IN_PAGE_HEIGHT,
  }),
)

function fitFloatingWindowToShares() {
  const openedWindow = floatingWindow.value
  if (!openedWindow || shareRows.value.length === 0) {
    return
  }
  ownResizeSettlesAt = Date.now() + OWN_RESIZE_SETTLING_MILLISECONDS
  openedWindow.resizeContent(
    fitMiniplayerContent(
      readRowsOfAspectRatios(),
      preferredTileWidth,
      openedWindow.readMaximumContentSize(),
    ),
  )
}

function adoptTileWidthOf(openedWindow: MiniplayerWindow) {
  const contentWidth = openedWindow.readContentWidth()
  if (contentWidth > 0) {
    preferredTileWidth = measureTileWidth(contentWidth, columnCount.value)
  }
}

const { start: adoptTileWidthOnceSettled } = useTimeoutFn(
  () => floatingWindow.value && adoptTileWidthOf(floatingWindow.value),
  OWN_RESIZE_SETTLING_MILLISECONDS,
  { immediate: false },
)

function rememberResizeByUser() {
  const openedWindow = floatingWindow.value
  if (openedWindow && Date.now() >= ownResizeSettlesAt) {
    adoptTileWidthOf(openedWindow)
  }
}

function forgetFloatingWindow() {
  unregisterMiniplayerView(props.group.id)
  floatingWindow.value = undefined
}

function handleFloatingWindowClosed() {
  forgetFloatingWindow()
  miniplayerStore.closeGroup(props.group.id)
}

function handleInPageCloseRequested() {
  miniplayerStore.closeGroup(props.group.id)
}

async function openMiniplayerWindow() {
  ownResizeSettlesAt = Date.now() + OWN_RESIZE_SETTLING_MILLISECONDS
  const openingSize = fitMiniplayerContent(
    readRowsOfAspectRatios(),
    preferredTileWidth,
    MAXIMUM_OPENING_SIZE,
  )
  const openedWindow = await openFloatingMiniplayerWindow(
    {
      size: { width: Math.round(openingSize.width), height: Math.round(openingSize.height) },
      title: windowTitle.value,
      groupId: props.group.id,
      screenPosition: props.group.openingPlacement,
    },
    handleFloatingWindowClosed,
  )
  if (isUnmounted) {
    openedWindow?.close()
    return
  }
  if (openedWindow) {
    floatingWindow.value = openedWindow
    registerMiniplayerView(props.group.id, openedWindow.view)
    fitFloatingWindowToShares()
    adoptTileWidthOnceSettled()
    return
  }
  isShowingInPage.value = true
}

watch(shareLayoutSignature, async () => {
  await nextTick()
  fitFloatingWindowToShares()
})

useEventListener(() => floatingWindow.value?.view, 'resize', rememberResizeByUser)

useEventListener(
  () => floatingWindow.value?.document,
  'resize',
  (resizeEvent: Event) => {
    if (resizeEvent.target instanceof HTMLVideoElement) {
      fitFloatingWindowToShares()
    }
  },
  { capture: true },
)

watch([floatingWindow, isDarkModeEnabled], ([openedWindow, isDark]) => {
  openedWindow?.document.documentElement.classList.toggle('dark', isDark)
})

watch([floatingWindow, windowTitle], ([openedWindow, title]) => {
  if (openedWindow) {
    openedWindow.document.title = title
  }
})

onMounted(openMiniplayerWindow)

onBeforeUnmount(() => {
  isUnmounted = true
  const openedWindow = floatingWindow.value
  forgetFloatingWindow()
  openedWindow?.close()
})
</script>

<template>
  <Teleport v-if="floatingWindow" :to="floatingWindow.mountElement">
    <div class="flex h-full flex-col">
      <MiniplayerWindowHeader :title="windowTitle" />
      <div class="min-h-0 flex-1">
        <MiniplayerPanel :group-id="group.id" :share-rows="shareRows" />
      </div>
    </div>
  </Teleport>
  <InPageMiniplayer
    v-else-if="isShowingInPage && shareRows.length > 0"
    :title="windowTitle"
    :content-width="inPageContentSize.width"
    :content-height="inPageContentSize.height"
    @close-requested="handleInPageCloseRequested"
  >
    <MiniplayerPanel :group-id="group.id" :share-rows="shareRows" />
  </InPageMiniplayer>
</template>
