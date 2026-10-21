<script setup lang="ts">
import { computed } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import { FallbackIcon, type AppIcon } from '@/theme/app-icons'
import type { IconSize } from '@/theme/component-sizes'

interface BaseIconProps {
  icon?: AppIcon
  size?: IconSize
  accessibleLabel?: string
}

const props = withDefaults(defineProps<BaseIconProps>(), {
  icon: () => FallbackIcon,
  size: 'md',
  accessibleLabel: undefined,
})

const iconPixelSizeBySize: Record<IconSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

const iconPixelSize = computed(() => iconPixelSizeBySize[props.size])
const isDecorative = computed(() => props.accessibleLabel === undefined)
</script>

<template>
  <HugeiconsIcon
    :icon="icon"
    :size="iconPixelSize"
    class="shrink-0"
    :role="isDecorative ? undefined : 'img'"
    :aria-label="accessibleLabel"
    :aria-hidden="isDecorative"
  />
</template>
