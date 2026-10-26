<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import BaseSwitch from '@/components/form/BaseSwitch.vue'
import BaseSegmentedControl, {
  type SegmentedControlOption,
} from '@/components/segmented-control/BaseSegmentedControl.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type {
  ScreenShareFrameRate,
  ScreenShareResolution,
  ScreenShareSettings,
} from '@/media/screen-share-quality'
import { useScreenShareStore } from '@/stores/screen-share-store'
import { ShareScreenIcon, SoundOnIcon } from '@/theme/app-icons'

export type ShareScreenDialogPurpose = 'start' | 'change'

interface ShareScreenDialogProps {
  purpose?: ShareScreenDialogPurpose
}

withDefaults(defineProps<ShareScreenDialogProps>(), {
  purpose: 'start',
})

const emit = defineEmits<{
  settingsConfirmed: [settings: ScreenShareSettings]
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const screenShareStore = useScreenShareStore()

const RESOLUTION_OPTIONS: SegmentedControlOption<ScreenShareResolution>[] = [
  { value: '480p', label: '480p' },
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' },
]

const FRAME_RATE_OPTIONS: SegmentedControlOption<ScreenShareFrameRate>[] = [
  { value: 30, label: '30 fps' },
  { value: 60, label: '60 fps' },
]

const selectedResolution = ref<ScreenShareResolution>('1080p')
const selectedFrameRate = ref<ScreenShareFrameRate>(30)
const shouldShareAudio = ref(true)

watch(isOpen, (isNowOpen) => {
  if (!isNowOpen) {
    return
  }
  const rememberedSettings = screenShareStore.shareSettings
  selectedResolution.value = rememberedSettings.resolution
  selectedFrameRate.value = rememberedSettings.frameRate
  shouldShareAudio.value = rememberedSettings.shouldShareAudio
})

function handleCancelButtonClick() {
  isOpen.value = false
}

function handleConfirmButtonClick() {
  emit('settingsConfirmed', {
    resolution: selectedResolution.value,
    frameRate: selectedFrameRate.value,
    shouldShareAudio: shouldShareAudio.value,
  })
}
</script>

<template>
  <BaseDialog
    v-model:open="isOpen"
    :title="purpose === 'start' ? 'Share your screen' : 'Change what you share'"
    :is-close-blocked="screenShareStore.isStartingShare"
  >
    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-2">
        <BaseText as="span" size="sm" weight="semibold">Quality</BaseText>
        <BaseSegmentedControl
          v-model="selectedResolution"
          :options="RESOLUTION_OPTIONS"
          accessible-label="Quality"
        />
      </div>
      <div class="flex flex-col gap-2">
        <BaseText as="span" size="sm" weight="semibold">Frame rate</BaseText>
        <BaseSegmentedControl
          v-model="selectedFrameRate"
          :options="FRAME_RATE_OPTIONS"
          accessible-label="Frame rate"
        />
        <BaseText size="caption" tone="subtle">
          Use 60 fps for games and videos, and 30 fps for sharper text.
        </BaseText>
      </div>
      <div class="flex flex-col gap-1">
        <BaseSwitch v-model="shouldShareAudio" label="Share audio" :icon="SoundOnIcon" />
        <BaseText size="caption" tone="subtle">
          Tabs share their audio in Chrome and Edge. Whole screens can share system audio on
          Windows.
        </BaseText>
      </div>
      <BaseText size="caption" tone="subtle">
        Next, your browser asks you to pick a screen, window or tab.
      </BaseText>
      <BaseText v-if="screenShareStore.captureErrorMessage" size="sm" tone="danger">
        {{ screenShareStore.captureErrorMessage }}
      </BaseText>
    </div>
    <template #actions>
      <BaseButton
        variant="neutral"
        appearance="outlined"
        :is-disabled="screenShareStore.isStartingShare"
        @click="handleCancelButtonClick"
      >
        Cancel
      </BaseButton>
      <BaseButton
        :leading-icon="ShareScreenIcon"
        :is-loading="screenShareStore.isStartingShare"
        @click="handleConfirmButtonClick"
      >
        Choose what to share
      </BaseButton>
    </template>
  </BaseDialog>
</template>
