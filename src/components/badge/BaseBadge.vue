<script setup lang="ts">
import type { ColorVariant } from '@/theme/color-variants'

interface BaseBadgeProps {
  variant?: ColorVariant
}

withDefaults(defineProps<BaseBadgeProps>(), {
  variant: 'primary',
})

const colorClassesByVariant: Record<ColorVariant, string> = {
  primary: 'bg-brand-600 text-white dark:bg-brand-500',
  neutral: 'bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100',
  danger: 'bg-danger-600 text-white dark:bg-danger-500',
  success: 'bg-success-600 text-white dark:bg-success-500 dark:text-success-950',
  warning: 'bg-warning-400 text-warning-950',
}
</script>

<template>
  <span
    class="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-caption font-bold"
    :class="colorClassesByVariant[variant]"
  >
    <slot />
  </span>
</template>
