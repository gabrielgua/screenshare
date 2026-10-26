<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import type { AppIcon } from '@/theme/app-icons'
import type { ColorVariant } from '@/theme/color-variants'

export type BadgeAppearance = 'solid' | 'soft'

interface BaseBadgeProps {
  variant?: ColorVariant
  appearance?: BadgeAppearance
  icon?: AppIcon
}

withDefaults(defineProps<BaseBadgeProps>(), {
  variant: 'primary',
  appearance: 'solid',
  icon: undefined,
})

const shapeClassesByAppearance: Record<BadgeAppearance, string> = {
  solid: 'h-5 min-w-5 justify-center px-1.5 font-bold',
  soft: 'h-6 gap-1 px-2 font-semibold ring-1 ring-inset',
}

const colorClassesByAppearance: Record<BadgeAppearance, Record<ColorVariant, string>> = {
  solid: {
    primary: 'bg-brand-600 text-white dark:bg-brand-500',
    neutral: 'bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100',
    danger: 'bg-danger-600 text-white dark:bg-danger-500',
    success: 'bg-success-600 text-white dark:bg-success-500 dark:text-success-950',
    warning: 'bg-warning-400 text-warning-950',
  },
  soft: {
    primary:
      'bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-950 dark:text-brand-300 dark:ring-brand-800',
    neutral:
      'bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700',
    danger:
      'bg-danger-50 text-danger-700 ring-danger-200 dark:bg-danger-950 dark:text-danger-300 dark:ring-danger-800',
    success:
      'bg-success-50 text-success-700 ring-success-200 dark:bg-success-950 dark:text-success-300 dark:ring-success-800',
    warning:
      'bg-warning-50 text-warning-800 ring-warning-200 dark:bg-warning-950 dark:text-warning-300 dark:ring-warning-800',
  },
}
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center rounded-full text-caption whitespace-nowrap"
    :class="[shapeClassesByAppearance[appearance], colorClassesByAppearance[appearance][variant]]"
  >
    <BaseIcon v-if="icon" :icon="icon" size="xs" />
    <slot />
  </span>
</template>
