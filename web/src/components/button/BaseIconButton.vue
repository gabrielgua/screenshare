<script setup lang="ts">
import { useAttrs } from 'vue'
import BaseTooltip, {
  type TooltipAlignment,
  type TooltipPlacement,
} from '@/components/tooltip/BaseTooltip.vue'
import type { AppIcon } from '@/theme/app-icons'
import type { Appearance, ColorVariant } from '@/theme/color-variants'
import type { ControlSize } from '@/theme/component-sizes'
import BaseButton, { type ButtonShape, type ButtonType } from './BaseButton.vue'

defineOptions({ inheritAttrs: false })

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
  tooltipPlacement?: TooltipPlacement
  tooltipAlignment?: TooltipAlignment
  hasTooltip?: boolean
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
  tooltipPlacement: 'top',
  tooltipAlignment: 'center',
  hasTooltip: true,
})

const attributes = useAttrs()

function readButtonAttributes(): Record<string, unknown> {
  const { class: wrapperClass, style: wrapperStyle, ...buttonAttributes } = attributes
  return buttonAttributes
}
</script>

<template>
  <BaseTooltip
    :text="accessibleLabel"
    :placement="tooltipPlacement"
    :alignment="tooltipAlignment"
    :is-disabled="!hasTooltip"
    :class="attributes.class"
    :style="attributes.style"
  >
    <BaseButton
      v-bind="readButtonAttributes()"
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
      is-icon-only
    />
  </BaseTooltip>
</template>
