<script setup lang="ts">
import { computed } from 'vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import { canUseMiniplayer } from '@/media/miniplayer-window'
import { useMiniplayerStore } from '@/stores/miniplayer-store'
import { useScreenShareStore } from '@/stores/screen-share-store'
import {
  ExitFullscreenIcon,
  FocusShareIcon,
  ShowSharesSideBySideIcon,
  FullscreenShareIcon,
  HideOwnShareIcon,
  OpenMiniplayerIcon,
  SoundOffIcon,
  SoundOnIcon,
} from '@/theme/app-icons'
import ShareVolumeControl from './ShareVolumeControl.vue'

interface ScreenShareTileControlsProps {
  screenShare: RoomScreenShare
  isFocused?: boolean
  isFullscreen?: boolean
}

const props = withDefaults(defineProps<ScreenShareTileControlsProps>(), {
  isFocused: false,
  isFullscreen: false,
})

const emit = defineEmits<{
  focusToggleRequested: []
  fullscreenToggleRequested: []
}>()

const screenShareStore = useScreenShareStore()

const miniplayerStore = useMiniplayerStore()
const isMiniplayerAvailable = canUseMiniplayer()

const miniplayerButtonLabel = computed(() =>
  props.screenShare.isOwnShare
    ? 'Watch your screen in the miniplayer'
    : `Watch ${props.screenShare.displayName}'s screen in the miniplayer`,
)

function handleMiniplayerButtonClick() {
  miniplayerStore.showShares([props.screenShare.userId])
}

function handleHideOwnShareButtonClick() {
  screenShareStore.toggleOwnShareVisibility()
}

function handleFocusButtonClick() {
  emit('focusToggleRequested')
}

function handleFullscreenButtonClick() {
  emit('fullscreenToggleRequested')
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-end gap-1">
    <template v-if="screenShare.isOwnShare">
      <BaseText
        as="span"
        size="caption"
        weight="medium"
        class="hidden items-center gap-1.5 px-2 @md/video-frame:flex"
        aria-live="polite"
      >
        <BaseIcon :icon="screenShareStore.isSharingAudio ? SoundOnIcon : SoundOffIcon" size="sm" />
        {{
          screenShareStore.isSharingAudio
            ? 'You are sharing with audio'
            : 'You are sharing without audio'
        }}
      </BaseText>
      <BaseIconButton
        :icon="HideOwnShareIcon"
        accessible-label="Hide your screen for you only"
        variant="neutral"
        appearance="ghost"
        @click="handleHideOwnShareButtonClick"
      />
    </template>
    <ShareVolumeControl v-if="!screenShare.isOwnShare" :screen-share="screenShare" />
    <BaseIconButton
      v-if="isMiniplayerAvailable && !isFullscreen"
      :icon="OpenMiniplayerIcon"
      :accessible-label="miniplayerButtonLabel"
      variant="neutral"
      appearance="ghost"
      @click="handleMiniplayerButtonClick"
    />
    <BaseIconButton
      v-if="!isFullscreen"
      :icon="isFocused ? ShowSharesSideBySideIcon : FocusShareIcon"
      :accessible-label="
        isFocused ? 'Show screens side by side' : `Focus ${screenShare.displayName}'s screen`
      "
      variant="neutral"
      appearance="ghost"
      @click="handleFocusButtonClick"
    />
    <BaseIconButton
      :icon="isFullscreen ? ExitFullscreenIcon : FullscreenShareIcon"
      :accessible-label="
        isFullscreen
          ? 'Exit full screen'
          : `Show ${screenShare.displayName}'s screen in full screen`
      "
      variant="neutral"
      appearance="ghost"
      @click="handleFullscreenButtonClick"
    />
  </div>
</template>
