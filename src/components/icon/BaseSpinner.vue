<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'
import { LoadingIcon } from '@/theme/app-icons'
import type { IconSize } from '@/theme/component-sizes'

interface BaseSpinnerProps {
  size?: IconSize
  accessibleLabel?: string
}

withDefaults(defineProps<BaseSpinnerProps>(), {
  size: 'md',
  accessibleLabel: 'Loading',
})
</script>

<template>
  <span role="status" class="inline-flex motion-safe:animate-spin">
    <BaseIcon :icon="LoadingIcon" :size="size" />
    <span class="sr-only">{{ accessibleLabel }}</span>
  </span>
</template>
