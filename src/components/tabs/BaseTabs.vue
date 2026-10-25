<script setup lang="ts" generic="TabValue extends string">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import type { AppIcon } from '@/theme/app-icons'

export interface BaseTabOption<OptionValue extends string> {
  value: OptionValue
  label: string
  icon?: AppIcon
}

interface BaseTabsProps {
  tabs: BaseTabOption<TabValue>[]
  accessibleLabel: string
}

defineProps<BaseTabsProps>()

const selectedTab = defineModel<TabValue>({ required: true })

function handleTabClick(tabValue: TabValue) {
  selectedTab.value = tabValue
}
</script>

<template>
  <div
    role="tablist"
    :aria-label="accessibleLabel"
    class="flex w-full gap-1 rounded-card bg-neutral-100 p-1 dark:bg-neutral-800"
  >
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="selectedTab === tab.value"
      class="flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      :class="
        selectedTab === tab.value
          ? 'bg-white text-neutral-900 shadow-card dark:bg-neutral-950 dark:text-neutral-50'
          : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
      "
      @click="handleTabClick(tab.value)"
    >
      <BaseIcon v-if="tab.icon" :icon="tab.icon" size="sm" />
      {{ tab.label }}
    </button>
  </div>
</template>
