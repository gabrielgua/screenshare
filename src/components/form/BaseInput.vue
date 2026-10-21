<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import { useFormFieldAccessibility } from '@/composables/use-form-field-accessibility'
import { HidePasswordIcon, ShowPasswordIcon, type AppIcon } from '@/theme/app-icons'
import type { FieldStatus } from '@/theme/color-variants'
import { iconSizeByControlSize, type ControlSize } from '@/theme/component-sizes'
import BaseFormField from './BaseFormField.vue'

export type InputType = 'text' | 'email' | 'password' | 'search' | 'url' | 'tel' | 'number'

interface BaseInputProps {
  label?: string
  hint?: string
  statusMessage?: string
  status?: FieldStatus
  size?: ControlSize
  type?: InputType
  placeholder?: string
  autocomplete?: string
  leadingIcon?: AppIcon
  isRequired?: boolean
  isDisabled?: boolean
  isReadOnly?: boolean
}

const props = withDefaults(defineProps<BaseInputProps>(), {
  label: undefined,
  hint: undefined,
  statusMessage: undefined,
  status: 'default',
  size: 'md',
  type: 'text',
  placeholder: undefined,
  autocomplete: undefined,
  leadingIcon: undefined,
  isRequired: false,
  isDisabled: false,
  isReadOnly: false,
})

const inputValue = defineModel<string>({ default: '' })

const { controlId, messageId, describedById, isInvalid } = useFormFieldAccessibility({
  hint: () => props.hint,
  statusMessage: () => props.statusMessage,
  status: () => props.status,
})

const leadingIconToneClassesByStatus: Record<FieldStatus, string> = {
  default: 'text-neutral-400 dark:text-neutral-500',
  danger: 'text-danger-500 dark:text-danger-400',
  success: 'text-success-600 dark:text-success-400',
  warning: 'text-warning-600 dark:text-warning-400',
}

const isPasswordVisible = ref(false)
const isPasswordInput = computed(() => props.type === 'password')
const renderedInputType = computed(() =>
  isPasswordInput.value && isPasswordVisible.value ? 'text' : props.type,
)
const passwordToggleLabel = computed(() =>
  isPasswordVisible.value ? 'Hide password' : 'Show password',
)
const passwordToggleIcon = computed(() =>
  isPasswordVisible.value ? HidePasswordIcon : ShowPasswordIcon,
)
const iconSize = computed(() => iconSizeByControlSize[props.size])

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value
}
</script>

<template>
  <BaseFormField
    v-slot="{ controlClasses }"
    :control-id="controlId"
    :message-id="messageId"
    :label="label"
    :hint="hint"
    :status-message="statusMessage"
    :status="status"
    :size="size"
    :is-required="isRequired"
    :is-disabled="isDisabled"
    line-mode="single-line"
  >
    <BaseIcon
      v-if="leadingIcon"
      :icon="leadingIcon"
      :size="iconSize"
      :class="leadingIconToneClassesByStatus[status]"
    />
    <input
      :id="controlId"
      v-model="inputValue"
      :type="renderedInputType"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="isRequired"
      :disabled="isDisabled"
      :readonly="isReadOnly"
      :aria-invalid="isInvalid"
      :aria-describedby="describedById"
      :class="controlClasses"
    />
    <BaseIconButton
      v-if="isPasswordInput"
      :icon="passwordToggleIcon"
      :accessible-label="passwordToggleLabel"
      :is-pressed="isPasswordVisible"
      :is-disabled="isDisabled"
      variant="neutral"
      appearance="ghost"
      size="sm"
      class="-mr-2 sm:-mr-1.5"
      @click="togglePasswordVisibility"
    />
    <slot name="trailing" />
  </BaseFormField>
</template>
