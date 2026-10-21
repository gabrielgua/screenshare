<script setup lang="ts">
import type { TextTone } from '@/theme/color-variants'

export type TextSize = 'caption' | 'sm' | 'md' | 'lg' | 'section' | 'subtitle' | 'title' | 'display'

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold'

export type TextElement =
  'p' | 'span' | 'div' | 'label' | 'strong' | 'small' | 'h1' | 'h2' | 'h3' | 'h4'

interface BaseTextProps {
  as?: TextElement
  size?: TextSize
  tone?: TextTone
  weight?: TextWeight
}

withDefaults(defineProps<BaseTextProps>(), {
  as: 'p',
  size: 'md',
  tone: 'default',
  weight: 'regular',
})

const sizeClassesBySize: Record<TextSize, string> = {
  caption: 'text-caption',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  section: 'text-base sm:text-lg',
  subtitle: 'text-lg sm:text-subtitle',
  title: 'text-2xl tracking-tight sm:text-title',
  display: 'text-3xl tracking-tight sm:text-display',
}

const toneClassesByTone: Record<TextTone, string> = {
  default: 'text-neutral-900 dark:text-neutral-50',
  muted: 'text-neutral-600 dark:text-neutral-300',
  subtle: 'text-neutral-500 dark:text-neutral-400',
  brand: 'text-brand-600 dark:text-brand-400',
  danger: 'text-danger-600 dark:text-danger-400',
  success: 'text-success-700 dark:text-success-400',
  warning: 'text-warning-700 dark:text-warning-400',
  inverse: 'text-white dark:text-neutral-900',
}

const weightClassesByWeight: Record<TextWeight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
}
</script>

<template>
  <component
    :is="as"
    :class="[sizeClassesBySize[size], toneClassesByTone[tone], weightClassesByWeight[weight]]"
  >
    <slot />
  </component>
</template>
