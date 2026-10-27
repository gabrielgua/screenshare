<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { DesktopCaptureSource } from '@/media/desktop-bridge-contract'
import { ShareableScreenIcon, ShareableWindowIcon } from '@/theme/app-icons'

interface DesktopSourceOptionProps {
  source: DesktopCaptureSource
  isSelected?: boolean
}

withDefaults(defineProps<DesktopSourceOptionProps>(), {
  isSelected: false,
})

const emit = defineEmits<{
  selected: []
}>()

function handleOptionClick() {
  emit('selected')
}
</script>

<template>
  <button
    type="button"
    :aria-pressed="isSelected"
    class="flex w-full min-w-0 flex-col gap-2 rounded-card border-2 p-2 text-left transition-colors duration-150 ease-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 motion-reduce:transition-none"
    :class="
      isSelected
        ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950'
        : 'border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800'
    "
    @click="handleOptionClick"
  >
    <span
      class="grid aspect-video w-full place-items-center overflow-hidden rounded-control bg-neutral-100 dark:bg-neutral-800"
    >
      <img :src="source.thumbnailDataUrl" alt="" class="size-full object-contain" />
    </span>
    <span class="flex min-w-0 items-center gap-2 px-1">
      <img
        v-if="source.appIconDataUrl"
        :src="source.appIconDataUrl"
        alt=""
        class="size-4 shrink-0"
      />
      <BaseIcon
        v-else
        :icon="source.kind === 'screen' ? ShareableScreenIcon : ShareableWindowIcon"
        size="sm"
        class="shrink-0 text-neutral-500 dark:text-neutral-400"
      />
      <BaseText as="span" size="sm" weight="medium" class="truncate">{{ source.name }}</BaseText>
    </span>
  </button>
</template>
