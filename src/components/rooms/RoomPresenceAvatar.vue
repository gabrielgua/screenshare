<script setup lang="ts">
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import type { ControlSize } from '@/theme/component-sizes'

interface RoomPresenceAvatarProps {
  name: string
  imageUrl?: string
  isPresent?: boolean
  size?: ControlSize
}

withDefaults(defineProps<RoomPresenceAvatarProps>(), {
  imageUrl: undefined,
  isPresent: false,
  size: 'md',
})

const presenceDotSizeClassesBySize: Record<ControlSize, string> = {
  sm: 'size-3',
  md: 'size-3.5',
  lg: 'size-4',
}
</script>

<template>
  <span class="relative inline-flex shrink-0">
    <BaseAvatar :name="name" :image-url="imageUrl" :size="size" />
    <span
      v-if="isPresent"
      class="absolute -right-0.5 -bottom-0.5 rounded-full bg-success-500 ring-2 ring-white dark:ring-neutral-900"
      :class="presenceDotSizeClassesBySize[size]"
      aria-hidden="true"
    />
  </span>
</template>
