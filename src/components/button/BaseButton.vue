<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseSpinner from '@/components/icon/BaseSpinner.vue'
import type { AppIcon } from '@/theme/app-icons'
import type { Appearance, ColorVariant } from '@/theme/color-variants'
import { iconSizeByControlSize, type ControlSize } from '@/theme/component-sizes'

export type ButtonType = 'button' | 'submit' | 'reset'

export type ButtonShape = 'rounded' | 'circle'

interface BaseButtonProps {
  variant?: ColorVariant
  appearance?: Appearance
  size?: ControlSize
  shape?: ButtonShape
  type?: ButtonType
  leadingIcon?: AppIcon
  trailingIcon?: AppIcon
  isIconOnly?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  isFullWidth?: boolean
}

const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'primary',
  appearance: 'solid',
  size: 'md',
  shape: 'rounded',
  type: 'button',
  leadingIcon: undefined,
  trailingIcon: undefined,
  isIconOnly: false,
  isLoading: false,
  isDisabled: false,
  isFullWidth: false,
})

const colorClassesByVariant: Record<ColorVariant, Record<Appearance, string>> = {
  primary: {
    solid:
      'border-transparent bg-brand-600 text-white enabled:hover:bg-brand-700 enabled:active:bg-brand-800 dark:bg-brand-500 dark:enabled:hover:bg-brand-600 dark:enabled:active:bg-brand-700',
    outlined:
      'border-brand-600 text-brand-700 enabled:hover:bg-brand-50 enabled:active:bg-brand-100 dark:border-brand-400 dark:text-brand-300 dark:enabled:hover:bg-brand-950 dark:enabled:active:bg-brand-900',
    ghost:
      'border-transparent text-brand-700 enabled:hover:bg-brand-50 enabled:active:bg-brand-100 dark:text-brand-300 dark:enabled:hover:bg-brand-950 dark:enabled:active:bg-brand-900',
  },
  neutral: {
    solid:
      'border-transparent bg-neutral-200 text-neutral-900 enabled:hover:bg-neutral-300 enabled:active:bg-neutral-400 dark:bg-neutral-700 dark:text-neutral-50 dark:enabled:hover:bg-neutral-600 dark:enabled:active:bg-neutral-500',
    outlined:
      'border-neutral-300 text-neutral-800 enabled:hover:bg-neutral-100 enabled:active:bg-neutral-200 dark:border-neutral-600 dark:text-neutral-100 dark:enabled:hover:bg-neutral-800 dark:enabled:active:bg-neutral-700',
    ghost:
      'border-transparent text-neutral-700 enabled:hover:bg-neutral-100 enabled:active:bg-neutral-200 dark:text-neutral-200 dark:enabled:hover:bg-neutral-800 dark:enabled:active:bg-neutral-700',
  },
  danger: {
    solid:
      'border-transparent bg-danger-600 text-white enabled:hover:bg-danger-700 enabled:active:bg-danger-800 dark:bg-danger-500 dark:enabled:hover:bg-danger-600 dark:enabled:active:bg-danger-700',
    outlined:
      'border-danger-600 text-danger-700 enabled:hover:bg-danger-50 enabled:active:bg-danger-100 dark:border-danger-400 dark:text-danger-300 dark:enabled:hover:bg-danger-950 dark:enabled:active:bg-danger-900',
    ghost:
      'border-transparent text-danger-700 enabled:hover:bg-danger-50 enabled:active:bg-danger-100 dark:text-danger-300 dark:enabled:hover:bg-danger-950 dark:enabled:active:bg-danger-900',
  },
  success: {
    solid:
      'border-transparent bg-success-600 text-white enabled:hover:bg-success-700 enabled:active:bg-success-800 dark:bg-success-500 dark:text-success-950 dark:enabled:hover:bg-success-400 dark:enabled:active:bg-success-300',
    outlined:
      'border-success-600 text-success-700 enabled:hover:bg-success-50 enabled:active:bg-success-100 dark:border-success-400 dark:text-success-300 dark:enabled:hover:bg-success-950 dark:enabled:active:bg-success-900',
    ghost:
      'border-transparent text-success-700 enabled:hover:bg-success-50 enabled:active:bg-success-100 dark:text-success-300 dark:enabled:hover:bg-success-950 dark:enabled:active:bg-success-900',
  },
  warning: {
    solid:
      'border-transparent bg-warning-400 text-warning-950 enabled:hover:bg-warning-500 enabled:active:bg-warning-600 dark:bg-warning-400 dark:enabled:hover:bg-warning-300 dark:enabled:active:bg-warning-200',
    outlined:
      'border-warning-500 text-warning-800 enabled:hover:bg-warning-50 enabled:active:bg-warning-100 dark:border-warning-400 dark:text-warning-300 dark:enabled:hover:bg-warning-950 dark:enabled:active:bg-warning-900',
    ghost:
      'border-transparent text-warning-800 enabled:hover:bg-warning-50 enabled:active:bg-warning-100 dark:text-warning-300 dark:enabled:hover:bg-warning-950 dark:enabled:active:bg-warning-900',
  },
}

const focusOutlineClassesByVariant: Record<ColorVariant, string> = {
  primary: 'focus-visible:outline-brand-500',
  neutral: 'focus-visible:outline-neutral-500',
  danger: 'focus-visible:outline-danger-500',
  success: 'focus-visible:outline-success-500',
  warning: 'focus-visible:outline-warning-500',
}

const sizeClassesBySize: Record<ControlSize, string> = {
  sm: 'h-10 px-3 text-sm sm:h-8',
  md: 'h-11 px-4 text-base sm:h-10 sm:text-sm',
  lg: 'h-12 px-6 text-base',
}

const iconOnlySizeClassesBySize: Record<ControlSize, string> = {
  sm: 'size-10 sm:size-8',
  md: 'size-11 sm:size-10',
  lg: 'size-14',
}

const shapeClassesByShape: Record<ButtonShape, string> = {
  rounded: 'rounded-control',
  circle: 'rounded-full',
}

const iconSize = computed(() => iconSizeByControlSize[props.size])
const isInteractionBlocked = computed(() => props.isDisabled || props.isLoading)
const sizeClasses = computed(() =>
  props.isIconOnly ? iconOnlySizeClassesBySize[props.size] : sizeClassesBySize[props.size],
)
</script>

<template>
  <button
    :type="type"
    class="flex shrink-0 cursor-pointer items-center justify-center gap-2 border font-semibold whitespace-nowrap transition-colors duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      colorClassesByVariant[variant][appearance],
      focusOutlineClassesByVariant[variant],
      sizeClasses,
      shapeClassesByShape[shape],
      { 'w-full': isFullWidth },
    ]"
    :disabled="isInteractionBlocked"
    :aria-busy="isLoading"
  >
    <BaseSpinner v-if="isLoading" :size="iconSize" />
    <BaseIcon v-else-if="leadingIcon" :icon="leadingIcon" :size="iconSize" />
    <slot />
    <BaseIcon v-if="trailingIcon" :icon="trailingIcon" :size="iconSize" />
  </button>
</template>
