<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { AppIcon } from '@/theme/app-icons'

interface DesktopAppFeatureProps {
  icon: AppIcon
  title: string
  description: string
}

defineProps<DesktopAppFeatureProps>()
</script>

<template>
  <li class="flex flex-col items-center gap-3">
    <span
      class="grid size-10 shrink-0 place-items-center rounded-control bg-white text-brand-600 shadow-card ring-1 ring-brand-100 dark:bg-neutral-900 dark:text-brand-300 dark:ring-brand-900"
    >
      <BaseIcon :icon="icon" size="md" />
    </span>
    <div class="flex flex-col gap-1">
      <BaseText as="span" size="sm" weight="semibold">{{ title }}</BaseText>
      <BaseText as="span" size="sm" tone="muted">{{ description }}</BaseText>
    </div>
  </li>
</template>
