<script setup lang="ts">
import { computed } from 'vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseSlider from '@/components/form/BaseSlider.vue'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import { useScreenShareStore } from '@/stores/screen-share-store'
import { SoundOffIcon, SoundOnIcon } from '@/theme/app-icons'
import type { ControlSize } from '@/theme/component-sizes'

interface ShareVolumeControlProps {
  screenShare: RoomScreenShare
  size?: ControlSize
}

const props = withDefaults(defineProps<ShareVolumeControlProps>(), {
  size: 'md',
})

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
</script>

<template>
  <div class="group/volume relative">
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
      tooltip-placement="left"
      variant="neutral"
      appearance="ghost"
      :size="size"
      :is-disabled="!hasAudio"
      @click="handleMuteButtonClick"
    />
  </div>
</template>
