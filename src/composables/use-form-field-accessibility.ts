import { computed, useId, type MaybeRefOrGetter, toValue } from 'vue'
import type { FieldStatus } from '@/theme/color-variants'

interface FormFieldAccessibilityOptions {
  hint: MaybeRefOrGetter<string | undefined>
  statusMessage: MaybeRefOrGetter<string | undefined>
  status: MaybeRefOrGetter<FieldStatus>
}

export function useFormFieldAccessibility(options: FormFieldAccessibilityOptions) {
  const controlId = useId()
  const messageId = `${controlId}-message`

  const hasVisibleMessage = computed(
    () => toValue(options.hint) !== undefined || toValue(options.statusMessage) !== undefined,
  )
  const describedById = computed(() => (hasVisibleMessage.value ? messageId : undefined))
  const isInvalid = computed(() => toValue(options.status) === 'danger')

  return { controlId, messageId, describedById, isInvalid }
}
