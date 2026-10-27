<script setup lang="ts">
import { ref, useId } from 'vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { ExpandSectionIcon } from '@/theme/app-icons'

interface RoomCollapsibleSectionProps {
  title: string
  description?: string
}

withDefaults(defineProps<RoomCollapsibleSectionProps>(), {
  description: undefined,
})

const isExpanded = ref(false)
const contentId = `room-collapsible-section-${useId()}`

function handleToggleButtonClick() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <section class="flex flex-col">
    <button
      type="button"
      :aria-expanded="isExpanded"
      :aria-controls="contentId"
      class="-mx-2 flex cursor-pointer items-center justify-between gap-3 rounded-control px-2 py-1.5 text-left transition-colors duration-150 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-brand-500 dark:hover:bg-neutral-800"
      @click="handleToggleButtonClick"
    >
      <BaseHeading :level="2" size="section">{{ title }}</BaseHeading>
      <BaseIcon
        :icon="ExpandSectionIcon"
        size="sm"
        class="shrink-0 text-neutral-500 transition-transform duration-300 ease-bounce motion-reduce:transition-none dark:text-neutral-400"
        :class="{ 'rotate-180': isExpanded }"
      />
    </button>
    <div
      :id="contentId"
      class="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
      :class="isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      :inert="!isExpanded"
    >
      <div class="min-h-0 overflow-hidden">
        <div class="flex flex-col gap-3 pt-2">
          <BaseText v-if="description" size="sm" tone="muted">{{ description }}</BaseText>
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>
