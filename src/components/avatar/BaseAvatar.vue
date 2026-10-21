<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ControlSize } from '@/theme/component-sizes'

interface BaseAvatarProps {
  name: string
  imageUrl?: string
  size?: ControlSize
}

const props = withDefaults(defineProps<BaseAvatarProps>(), {
  imageUrl: undefined,
  size: 'md',
})

const sizeClassesBySize: Record<ControlSize, string> = {
  sm: 'size-8 text-caption',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
}

const hasImageFailedToLoad = ref(false)
const shouldShowImage = computed(() => props.imageUrl !== undefined && !hasImageFailedToLoad.value)
const initials = computed(() =>
  props.name
    .split(' ')
    .filter((namePart) => namePart.length > 0)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join(''),
)

watch(
  () => props.imageUrl,
  () => {
    hasImageFailedToLoad.value = false
  },
)

function handleImageLoadError() {
  hasImageFailedToLoad.value = true
}
</script>

<template>
  <span
    class="grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-200"
    :class="sizeClassesBySize[size]"
  >
    <img
      v-if="shouldShowImage"
      :src="imageUrl"
      :alt="name"
      class="size-full object-cover"
      referrerpolicy="no-referrer"
      @error="handleImageLoadError"
    />
    <span v-else aria-hidden="true">{{ initials }}</span>
  </span>
</template>
