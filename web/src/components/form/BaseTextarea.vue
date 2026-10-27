<script setup lang="ts">
import { useFormFieldAccessibility } from '@/composables/use-form-field-accessibility'
import type { FieldStatus } from '@/theme/color-variants'
import type { ControlSize } from '@/theme/component-sizes'
import BaseFormField from './BaseFormField.vue'

interface BaseTextareaProps {
  label?: string
  hint?: string
  statusMessage?: string
  status?: FieldStatus
  size?: ControlSize
  placeholder?: string
  visibleRowCount?: number
  maximumLength?: number
  isRequired?: boolean
  isDisabled?: boolean
  isReadOnly?: boolean
}

const props = withDefaults(defineProps<BaseTextareaProps>(), {
  label: undefined,
  hint: undefined,
  statusMessage: undefined,
  status: 'default',
  size: 'md',
  placeholder: undefined,
  visibleRowCount: 4,
  maximumLength: undefined,
  isRequired: false,
  isDisabled: false,
  isReadOnly: false,
})

const textareaValue = defineModel<string>({ default: '' })

const { controlId, messageId, describedById, isInvalid } = useFormFieldAccessibility({
  hint: () => props.hint,
  statusMessage: () => props.statusMessage,
  status: () => props.status,
})
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
    line-mode="multi-line"
  >
    <textarea
      :id="controlId"
      v-model="textareaValue"
      :rows="visibleRowCount"
      :maxlength="maximumLength"
      :placeholder="placeholder"
      :required="isRequired"
      :disabled="isDisabled"
      :readonly="isReadOnly"
      :aria-invalid="isInvalid"
      :aria-describedby="describedById"
      :class="[controlClasses, 'resize-y']"
    />
  </BaseFormField>
</template>
