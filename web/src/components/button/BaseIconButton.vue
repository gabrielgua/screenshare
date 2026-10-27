<script setup lang="ts">
import type { AppIcon } from '@/theme/app-icons'
import type { Appearance, ColorVariant } from '@/theme/color-variants'
import type { ControlSize } from '@/theme/component-sizes'
import BaseButton, { type ButtonShape, type ButtonType } from './BaseButton.vue'

interface BaseIconButtonProps {
  icon: AppIcon
  accessibleLabel: string
  variant?: ColorVariant
  appearance?: Appearance
  size?: ControlSize
  shape?: ButtonShape
  type?: ButtonType
  isPressed?: boolean
  isLoading?: boolean
  isDisabled?: boolean
}

withDefaults(defineProps<BaseIconButtonProps>(), {
  variant: 'primary',
  appearance: 'solid',
  size: 'md',
  shape: 'rounded',
  type: 'button',
  isPressed: undefined,
  isLoading: false,
  isDisabled: false,
})
</script>

<template>
  <BaseButton
    :leading-icon="icon"
    :variant="variant"
    :appearance="appearance"
    :size="size"
    :shape="shape"
    :type="type"
    :is-loading="isLoading"
    :is-disabled="isDisabled"
    :aria-pressed="isPressed"
    :aria-label="accessibleLabel"
    :title="accessibleLabel"
    is-icon-only
  />
</template>
