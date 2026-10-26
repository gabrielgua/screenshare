<script setup lang="ts" generic="OptionValue extends string | number">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import type { AppIcon } from '@/theme/app-icons'

export type SegmentedControlKind = 'tabs' | 'choices'

export interface SegmentedControlOption<Value extends string | number> {
  value: Value
  label: string
  icon?: AppIcon
}

interface BaseSegmentedControlProps {
  options: SegmentedControlOption<OptionValue>[]
  accessibleLabel: string
  kind?: SegmentedControlKind
}

const props = withDefaults(defineProps<BaseSegmentedControlProps>(), {
  kind: 'choices',
})

const selectedValue = defineModel<OptionValue>({ required: true })

const groupRoleByKind: Record<SegmentedControlKind, string> = {
  tabs: 'tablist',
  choices: 'radiogroup',
}

const optionRoleByKind: Record<SegmentedControlKind, string> = {
  tabs: 'tab',
  choices: 'radio',
}

function readSelectionAttributes(optionValue: OptionValue) {
  const isSelected = selectedValue.value === optionValue
  return props.kind === 'tabs' ? { 'aria-selected': isSelected } : { 'aria-checked': isSelected }
}

function handleOptionClick(optionValue: OptionValue) {
  selectedValue.value = optionValue
}
</script>

<template>
  <div
    :role="groupRoleByKind[kind]"
    :aria-label="accessibleLabel"
    class="flex w-full gap-1 rounded-card bg-neutral-100 p-1 dark:bg-neutral-800"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :role="optionRoleByKind[kind]"
      v-bind="readSelectionAttributes(option.value)"
      class="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      :class="
        selectedValue === option.value
          ? 'bg-white text-neutral-900 shadow-card dark:bg-neutral-950 dark:text-neutral-50'
          : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
      "
      @click="handleOptionClick(option.value)"
    >
      <BaseIcon v-if="option.icon" :icon="option.icon" size="sm" />
      {{ option.label }}
    </button>
  </div>
</template>
