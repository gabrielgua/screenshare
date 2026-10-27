<script setup lang="ts">
import { computed } from 'vue'
import type { ControlSize } from '@/theme/component-sizes'
import BaseAvatar from './BaseAvatar.vue'

export interface AvatarStackPerson {
  id: string
  name: string
  imageUrl?: string
}

interface BaseAvatarStackProps {
  people: AvatarStackPerson[]
  maximumVisibleCount?: number
  size?: ControlSize
}

const props = withDefaults(defineProps<BaseAvatarStackProps>(), {
  maximumVisibleCount: 3,
  size: 'sm',
})

const overflowSizeClassesBySize: Record<ControlSize, string> = {
  sm: 'size-8 text-caption',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
}

const visiblePeople = computed(() => props.people.slice(0, props.maximumVisibleCount))
const hiddenPeopleCount = computed(() => props.people.length - visiblePeople.value.length)
</script>

<template>
  <div class="flex items-center -space-x-2">
    <BaseAvatar
      v-for="person in visiblePeople"
      :key="person.id"
      :name="person.name"
      :image-url="person.imageUrl"
      :size="size"
      :title="person.name"
      class="ring-2 ring-white dark:ring-neutral-900"
    />
    <span
      v-if="hiddenPeopleCount > 0"
      class="grid shrink-0 place-items-center rounded-full bg-neutral-200 font-semibold text-neutral-700 ring-2 ring-white dark:bg-neutral-700 dark:text-neutral-100 dark:ring-neutral-900"
      :class="overflowSizeClassesBySize[size]"
    >
      +{{ hiddenPeopleCount }}
    </span>
  </div>
</template>
