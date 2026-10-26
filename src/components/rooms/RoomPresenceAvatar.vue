<script setup lang="ts">
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import { ShareScreenIcon } from '@/theme/app-icons'
import type { ControlSize } from '@/theme/component-sizes'

interface RoomPresenceAvatarProps {
  name: string
  imageUrl?: string
  isPresent?: boolean
  isSharingScreen?: boolean
  size?: ControlSize
}

withDefaults(defineProps<RoomPresenceAvatarProps>(), {
  imageUrl: undefined,
  isPresent: false,
  isSharingScreen: false,
  size: 'md',
})

const sharingBadgeSizeClassesBySize: Record<ControlSize, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
}

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
      v-if="isSharingScreen"
      class="absolute -top-1 -right-1 grid place-items-center rounded-full bg-brand-600 text-white ring-2 ring-white dark:bg-brand-500 dark:ring-neutral-900"
      :class="sharingBadgeSizeClassesBySize[size]"
      :title="`${name} is sharing their screen`"
    >
      <BaseIcon :icon="ShareScreenIcon" size="xs" />
    </span>
    <span
      v-if="isPresent"
      class="absolute -right-0.5 -bottom-0.5 rounded-full bg-success-500 ring-2 ring-white dark:ring-neutral-900"
      :class="presenceDotSizeClassesBySize[size]"
      aria-hidden="true"
    />
  </span>
</template>
