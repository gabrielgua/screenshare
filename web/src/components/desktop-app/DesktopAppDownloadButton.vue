<script setup lang="ts">
import BaseButton from '@/components/button/BaseButton.vue'
import { openDesktopAppDownload } from '@/media/desktop-bridge'
import { DownloadIcon } from '@/theme/app-icons'
import type { Appearance, ColorVariant } from '@/theme/color-variants'
import type { ControlSize } from '@/theme/component-sizes'

interface DesktopAppDownloadButtonProps {
  variant?: ColorVariant
  appearance?: Appearance
  size?: ControlSize
}

withDefaults(defineProps<DesktopAppDownloadButtonProps>(), {
  variant: 'neutral',
  appearance: 'outlined',
  size: 'sm',
})

function handleDownloadButtonClick() {
  openDesktopAppDownload()
}
</script>

<template>
  <BaseButton
    :leading-icon="DownloadIcon"
    :variant="variant"
    :appearance="appearance"
    :size="size"
    @click="handleDownloadButtonClick"
  >
    Get the Windows app
  </BaseButton>
</template>
