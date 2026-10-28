<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useEventListener } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { useColorScheme } from '@/composables/use-color-scheme'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import { fitMiniplayerContent } from '@/media/miniplayer-layout'
import { openFloatingMiniplayerWindow, type MiniplayerWindow } from '@/media/miniplayer-window'
import { FALLBACK_SHARE_ASPECT_RATIO } from '@/media/video-shape'
import { useActiveRoomStore, type ActiveRoom } from '@/stores/active-room-store'
import { useMiniplayerStore } from '@/stores/miniplayer-store'
import InPageMiniplayer from './InPageMiniplayer.vue'
import MiniplayerPanel from './MiniplayerPanel.vue'

interface MiniplayerHostProps {
  room: ActiveRoom
  screenShares: RoomScreenShare[]
}

const props = defineProps<MiniplayerHostProps>()

const MINIPLAYER_WINDOW_WIDTH = 480
const MAXIMUM_MINIPLAYER_WINDOW_HEIGHT = 820
const IN_PAGE_MINIPLAYER_WIDTH = 384
const MAXIMUM_IN_PAGE_MINIPLAYER_HEIGHT = 640

const route = useRoute()
const miniplayerStore = useMiniplayerStore()
const activeRoomStore = useActiveRoomStore()
const { isDarkModeEnabled } = useColorScheme()

const floatingWindow = shallowRef<MiniplayerWindow>()
const isShowingInPage = ref(false)
let isOpeningWindow = false

const screenSharesByUserId = computed(
  () => new Map(props.screenShares.map((screenShare) => [screenShare.userId, screenShare])),
)
const shareRows = computed(() =>
  miniplayerStore.shareRows
    .map((userIds) =>
      userIds.flatMap((userId) => {
        const screenShare = screenSharesByUserId.value.get(userId)
        return screenShare ? [screenShare] : []
      }),
    )
    .filter((shareRow) => shareRow.length > 0),
)

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

const inPageContentHeight = computed(
  () =>
    fitMiniplayerContent(
      readRowsOfAspectRatios(),
      IN_PAGE_MINIPLAYER_WIDTH,
      MAXIMUM_IN_PAGE_MINIPLAYER_HEIGHT,
    ).height,
)

function fitFloatingWindowToShares() {
  const openedWindow = floatingWindow.value
  if (!openedWindow || shareRows.value.length === 0) {
    return
  }
  openedWindow.resizeContent(
    fitMiniplayerContent(
      readRowsOfAspectRatios(),
      openedWindow.readContentWidth(),
      openedWindow.readMaximumContentHeight(),
    ),
  )
}

function isViewingTheRoom(): boolean {
  return route.name === 'room' && route.params.roomId === props.room.id
}

function handleFloatingWindowClosed() {
  floatingWindow.value = undefined
  miniplayerStore.close()
}

function handleInPageCloseRequested() {
  miniplayerStore.close()
}

async function openMiniplayer() {
  if (isOpeningWindow || floatingWindow.value || isShowingInPage.value) {
    return
  }
  isOpeningWindow = true
  const openingSize = fitMiniplayerContent(
    readRowsOfAspectRatios(),
    MINIPLAYER_WINDOW_WIDTH,
    MAXIMUM_MINIPLAYER_WINDOW_HEIGHT,
  )
  const openedWindow = await openFloatingMiniplayerWindow(
    { width: Math.round(openingSize.width), height: Math.round(openingSize.height) },
    `${props.room.name} · Screenshare`,
    handleFloatingWindowClosed,
  )
  isOpeningWindow = false
  if (!miniplayerStore.isOpen) {
    openedWindow?.close()
    return
  }
  if (openedWindow) {
    floatingWindow.value = openedWindow
    return
  }
  isShowingInPage.value = true
}

function closeMiniplayer() {
  floatingWindow.value?.close()
  floatingWindow.value = undefined
  isShowingInPage.value = false
}

watch(
  () => miniplayerStore.isOpen,
  (isOpen) => {
    if (isOpen) {
      void openMiniplayer()
      return
    }
    closeMiniplayer()
    if (!isViewingTheRoom()) {
      activeRoomStore.leaveRoom()
    }
  },
)

watch(
  () => props.screenShares.map((screenShare) => screenShare.userId),
  (availableUserIds) => miniplayerStore.keepOnlyShares(availableUserIds),
)

watch(shareLayoutSignature, async () => {
  await nextTick()
  fitFloatingWindowToShares()
})

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

onBeforeUnmount(() => {
  closeMiniplayer()
  miniplayerStore.close()
})
</script>

<template>
  <Teleport v-if="floatingWindow" :to="floatingWindow.mountElement">
    <MiniplayerPanel :share-rows="shareRows" />
  </Teleport>
  <InPageMiniplayer
    v-else-if="isShowingInPage && shareRows.length > 0"
    :content-height="inPageContentHeight"
    @close-requested="handleInPageCloseRequested"
  >
    <MiniplayerPanel :share-rows="shareRows" />
  </InPageMiniplayer>
</template>
