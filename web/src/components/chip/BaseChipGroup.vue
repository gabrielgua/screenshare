<script setup lang="ts" generic="ChipValue extends string">
import BaseText from '@/components/typography/BaseText.vue'
import type { AppIcon } from '@/theme/app-icons'
import BaseChip from './BaseChip.vue'

export interface BaseChipOption<OptionValue extends string> {
  value: OptionValue
  label: string
  icon?: AppIcon
}

interface BaseChipGroupProps {
  groupLabel: string
  options: BaseChipOption<ChipValue>[]
}

defineProps<BaseChipGroupProps>()

const selectedValues = defineModel<ChipValue[]>({ required: true })

function toggleValue(toggledValue: ChipValue) {
  selectedValues.value = selectedValues.value.includes(toggledValue)
    ? selectedValues.value.filter((selectedValue) => selectedValue !== toggledValue)
    : [...selectedValues.value, toggledValue]
}
</script>

<template>
  <div role="group" :aria-label="groupLabel" class="flex flex-wrap items-center gap-2">
    <BaseText
      as="span"
      size="caption"
      weight="semibold"
      tone="subtle"
      class="w-full uppercase tracking-wide sm:w-auto"
    >
      {{ groupLabel }}
    </BaseText>
    <BaseChip
      v-for="option in options"
      :key="option.value"
      :icon="option.icon"
      :is-selected="selectedValues.includes(option.value)"
      @selection-toggled="toggleValue(option.value)"
    >
      {{ option.label }}
    </BaseChip>
  </div>
</template>
