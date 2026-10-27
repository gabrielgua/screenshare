<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { InformationIcon, SuccessIcon, WarningIcon, type AppIcon } from '@/theme/app-icons'
import type { FieldStatus, TextTone } from '@/theme/color-variants'
import type { ControlSize } from '@/theme/component-sizes'

export type FieldLineMode = 'single-line' | 'multi-line'

interface BaseFormFieldProps {
  controlId: string
  messageId: string
  label?: string
  hint?: string
  statusMessage?: string
  status?: FieldStatus
  size?: ControlSize
  lineMode?: FieldLineMode
  isRequired?: boolean
  isDisabled?: boolean
}

const props = withDefaults(defineProps<BaseFormFieldProps>(), {
  label: undefined,
  hint: undefined,
  statusMessage: undefined,
  status: 'default',
  size: 'md',
  lineMode: 'single-line',
  isRequired: false,
  isDisabled: false,
})

const CONTROL_CLASSES =
  'min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed dark:placeholder:text-neutral-500'

const surfaceClassesByStatus: Record<FieldStatus, string> = {
  default:
    'border-neutral-300 hover:border-neutral-400 focus-within:border-brand-500 focus-within:ring-brand-500/25 dark:border-neutral-700 dark:hover:border-neutral-600 dark:focus-within:border-brand-400 dark:focus-within:ring-brand-400/25',
  danger:
    'border-danger-500 focus-within:ring-danger-500/25 dark:border-danger-400 dark:focus-within:ring-danger-400/25',
  success:
    'border-success-500 focus-within:ring-success-500/25 dark:border-success-400 dark:focus-within:ring-success-400/25',
  warning:
    'border-warning-500 focus-within:ring-warning-500/25 dark:border-warning-400 dark:focus-within:ring-warning-400/25',
}

const surfaceSizeClassesByLineMode: Record<FieldLineMode, Record<ControlSize, string>> = {
  'single-line': {
    sm: 'h-10 px-3 sm:h-8 sm:text-sm',
    md: 'h-11 px-3.5 sm:h-10 sm:text-sm',
    lg: 'h-12 px-4',
  },
  'multi-line': {
    sm: 'px-3 py-2 sm:text-sm',
    md: 'px-3.5 py-2.5 sm:text-sm',
    lg: 'px-4 py-3',
  },
}

const messageToneByStatus: Record<FieldStatus, TextTone> = {
  default: 'subtle',
  danger: 'danger',
  success: 'success',
  warning: 'warning',
}

const messageIconByStatus: Record<FieldStatus, AppIcon> = {
  default: InformationIcon,
  danger: WarningIcon,
  success: SuccessIcon,
  warning: WarningIcon,
}

const visibleMessage = computed(() => props.statusMessage ?? props.hint)
const messageTone = computed(() =>
  props.statusMessage ? messageToneByStatus[props.status] : 'subtle',
)
const shouldShowMessageIcon = computed(
  () => props.statusMessage !== undefined && props.status !== 'default',
)
</script>

<template>
  <div class="flex w-full flex-col gap-1.5">
    <BaseText v-if="label" as="label" :for="controlId" size="sm" weight="semibold">
      {{ label }}
      <span v-if="isRequired" class="text-danger-600 dark:text-danger-400" aria-hidden="true">
        *
      </span>
    </BaseText>

    <div
      class="flex w-full gap-2 rounded-control border text-base text-neutral-900 transition-colors duration-150 focus-within:ring-3 dark:text-neutral-50"
      :class="[
        surfaceClassesByStatus[status],
        surfaceSizeClassesByLineMode[lineMode][size],
        {
          'items-center': lineMode === 'single-line',
          'bg-white dark:bg-neutral-900': !isDisabled,
          'cursor-not-allowed bg-neutral-100 opacity-60 dark:bg-neutral-800': isDisabled,
        },
      ]"
    >
      <slot :control-classes="CONTROL_CLASSES" />
    </div>

    <BaseText
      v-if="visibleMessage"
      :id="messageId"
      as="small"
      size="caption"
      weight="medium"
      :tone="messageTone"
      class="flex items-center gap-1"
      :aria-live="statusMessage ? 'polite' : undefined"
    >
      <BaseIcon v-if="shouldShowMessageIcon" :icon="messageIconByStatus[status]" size="xs" />
      {{ visibleMessage }}
    </BaseText>
  </div>
</template>
