<script setup lang="ts">
import { computed } from 'vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseSlider from '@/components/form/BaseSlider.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import { useScreenShareStore } from '@/stores/screen-share-store'
import {
  ExitFullscreenIcon,
  FocusShareIcon,
  ShowSharesSideBySideIcon,
  FullscreenShareIcon,
  HideOwnShareIcon,
  SoundOffIcon,
  SoundOnIcon,
} from '@/theme/app-icons'

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

const shareAudio = computed(() => screenShareStore.readAudio(props.screenShare.userId))
const hasAudio = computed(() => (props.screenShare.stream?.getAudioTracks().length ?? 0) > 0)
const isSilent = computed(
  () => !hasAudio.value || shareAudio.value.isMuted || shareAudio.value.volume === 0,
)
const muteButtonLabel = computed(() => {
  if (!hasAudio.value) {
    return `${props.screenShare.displayName} is sharing without audio`
  }
  return isSilent.value
    ? `Unmute ${props.screenShare.displayName}`
    : `Mute ${props.screenShare.displayName}`
})
const shareVolume = computed({
  get: () => (shareAudio.value.isMuted || !hasAudio.value ? 0 : shareAudio.value.volume),
  set: (volume: number) => screenShareStore.setVolume(props.screenShare.userId, volume),
})

function handleMuteButtonClick() {
  screenShareStore.toggleMuted(props.screenShare.userId)
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
  <div class="flex items-center gap-1">
    <template v-if="screenShare.isOwnShare">
      <BaseText
        as="span"
        size="caption"
        weight="medium"
        class="hidden items-center gap-1.5 px-2 sm:flex"
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
    <div v-if="!screenShare.isOwnShare" class="group/volume relative">
      <div
        class="absolute bottom-full left-1/2 hidden -translate-x-1/2 pb-2 group-focus-within/volume:block group-hover/volume:block"
      >
        <div
          class="flex rounded-full border border-neutral-700 bg-neutral-900/90 px-2 py-3 shadow-card"
        >
          <BaseSlider
            v-model="shareVolume"
            orientation="vertical"
            :accessible-label="`${screenShare.displayName} volume`"
            :is-disabled="!hasAudio"
          />
        </div>
      </div>
      <BaseIconButton
        :icon="isSilent ? SoundOffIcon : SoundOnIcon"
        :accessible-label="muteButtonLabel"
        variant="neutral"
        appearance="ghost"
        :is-disabled="!hasAudio"
        @click="handleMuteButtonClick"
      />
    </div>
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
