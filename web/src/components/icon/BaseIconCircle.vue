<script setup lang="ts">
import type { AppIcon } from '@/theme/app-icons'
import type { ColorVariant } from '@/theme/color-variants'
import type { ControlSize, IconSize } from '@/theme/component-sizes'
import BaseIcon from './BaseIcon.vue'

interface BaseIconCircleProps {
  icon: AppIcon
  variant?: ColorVariant
  size?: ControlSize
}

withDefaults(defineProps<BaseIconCircleProps>(), {
  variant: 'primary',
  size: 'md',
})

const colorClassesByVariant: Record<ColorVariant, string> = {
  primary: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
  danger: 'bg-danger-100 text-danger-600 dark:bg-danger-950 dark:text-danger-400',
  success: 'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-400',
  warning: 'bg-warning-100 text-warning-800 dark:bg-warning-950 dark:text-warning-300',
}

const circleSizeClassesBySize: Record<ControlSize, string> = {
  sm: 'size-10',
  md: 'size-14',
  lg: 'size-20',
}

const iconSizeByCircleSize: Record<ControlSize, IconSize> = {
  sm: 'md',
  md: 'lg',
  lg: 'xl',
}
</script>

<template>
  <span
    class="grid shrink-0 place-items-center rounded-full"
    :class="[colorClassesByVariant[variant], circleSizeClassesBySize[size]]"
  >
    <BaseIcon :icon="icon" :size="iconSizeByCircleSize[size]" />
  </span>
</template>
