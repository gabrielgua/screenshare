<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import type { AppIcon } from '@/theme/app-icons'

interface BaseChipProps {
  isSelected?: boolean
  icon?: AppIcon
}

withDefaults(defineProps<BaseChipProps>(), {
  isSelected: false,
  icon: undefined,
})

const emit = defineEmits<{
  selectionToggled: []
}>()

function handleChipClick() {
  emit('selectionToggled')
}
</script>

<template>
  <button
    type="button"
    :aria-pressed="isSelected"
    class="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold ring-1 transition-colors duration-150 select-none ring-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:h-8 sm:px-3"
    :class="{
      'bg-brand-50 text-brand-700 ring-brand-300 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-200 dark:ring-brand-700 dark:hover:bg-brand-900':
        isSelected,
      'bg-white text-neutral-700 ring-neutral-200 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-700 dark:hover:bg-neutral-800':
        !isSelected,
    }"
    @click="handleChipClick"
  >
    <BaseIcon v-if="icon" :icon="icon" size="xs" />
    <slot />
  </button>
</template>
