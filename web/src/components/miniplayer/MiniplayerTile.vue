<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseSpinner from '@/components/icon/BaseSpinner.vue'
import FittedVideoFrame from '@/components/screen-share/FittedVideoFrame.vue'
import ScreenShareVideo from '@/components/screen-share/ScreenShareVideo.vue'
import ShareVolumeControl from '@/components/screen-share/ShareVolumeControl.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import { FALLBACK_SHARE_ASPECT_RATIO } from '@/media/video-shape'
import { useActiveRoomStore } from '@/stores/active-room-store'
import { useMiniplayerStore, type MiniplayerDropEdge } from '@/stores/miniplayer-store'
import { useScreenShareStore } from '@/stores/screen-share-store'
import { DragHandleIcon, ReturnFromMiniplayerIcon } from '@/theme/app-icons'
import MiniplayerDropIndicator from './MiniplayerDropIndicator.vue'

interface MiniplayerTileProps {
  screenShare: RoomScreenShare
  canBeDragged?: boolean
  isDragged?: boolean
  dropEdge?: MiniplayerDropEdge
}

const props = withDefaults(defineProps<MiniplayerTileProps>(), {
  canBeDragged: false,
  isDragged: false,
  dropEdge: undefined,
})

const route = useRoute()
const router = useRouter()
const miniplayerStore = useMiniplayerStore()
const activeRoomStore = useActiveRoomStore()
const screenShareStore = useScreenShareStore()

const videoAspectRatio = ref(FALLBACK_SHARE_ASPECT_RATIO)
const shareAudio = computed(() => screenShareStore.readAudio(props.screenShare.userId))
const shareLabel = computed(() =>
  props.screenShare.isOwnShare ? 'You' : props.screenShare.displayName,
)
const cursorClasses = computed(() => {
  if (props.isDragged) {
    return 'cursor-grabbing'
  }
  return props.canBeDragged ? 'cursor-grab' : 'cursor-default'
})

function handleVideoAspectRatioChanged(aspectRatio: number) {
  videoAspectRatio.value = aspectRatio
}

async function handleReturnButtonClick() {
  const activeRoomId = activeRoomStore.activeRoom?.id
  const isViewingTheRoom = route.name === 'room' && route.params.roomId === activeRoomId
  if (activeRoomId && !isViewingTheRoom) {
    await router.push({ name: 'room', params: { roomId: activeRoomId } })
  }
  miniplayerStore.returnShare(props.screenShare.userId)
}
</script>

<template>
  <article
    class="group/miniplayer-tile relative size-full overflow-hidden rounded-card bg-neutral-950 ring-2 transition-shadow duration-200"
    :class="[cursorClasses, isDragged ? 'shadow-card ring-brand-500' : 'ring-transparent']"
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
      <div v-else class="flex size-full items-center justify-center gap-2 text-neutral-400">
        <BaseSpinner size="sm" />
        <BaseText as="span" size="caption" tone="inverse">Connecting</BaseText>
      </div>
      <span
        v-if="canBeDragged"
        class="pointer-events-none absolute top-2 left-2 grid size-7 place-items-center rounded-control bg-neutral-950/70 text-white opacity-0 transition-opacity duration-200 group-hover/miniplayer-tile:opacity-100 motion-reduce:transition-none"
        aria-hidden="true"
      >
        <BaseIcon :icon="DragHandleIcon" size="sm" />
      </span>
      <div
        class="dark pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-neutral-950/80 to-transparent p-1.5 pt-8 opacity-0 transition-opacity duration-200 group-hover/miniplayer-tile:opacity-100 motion-reduce:transition-none"
      >
        <div class="flex min-w-0 items-center gap-1.5 px-1 @max-3xs/video-frame:hidden">
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
        <div
          class="pointer-events-auto ml-auto flex min-w-0 flex-wrap items-center justify-end gap-0.5"
        >
          <ShareVolumeControl
            v-if="!screenShare.isOwnShare"
            :screen-share="screenShare"
            size="sm"
          />
          <BaseIconButton
            :icon="ReturnFromMiniplayerIcon"
            :accessible-label="
              screenShare.isOwnShare
                ? 'Put your screen back in the room'
                : `Put ${screenShare.displayName}'s screen back in the room`
            "
            tooltip-placement="left"
            variant="neutral"
            appearance="ghost"
            size="sm"
            @click="handleReturnButtonClick"
          />
        </div>
      </div>
    </FittedVideoFrame>
    <MiniplayerDropIndicator v-if="dropEdge" :key="dropEdge" :edge="dropEdge" />
  </article>
</template>
