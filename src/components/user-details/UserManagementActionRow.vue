<script setup lang="ts">
import BaseText from '@/components/typography/BaseText.vue'

interface UserManagementActionRowProps {
  title: string
  description: string
}

defineProps<UserManagementActionRowProps>()
</script>

<template>
  <div
    class="flex flex-col gap-3 border-t border-neutral-100 pt-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6 dark:border-neutral-800"
  >
    <div class="flex min-w-0 flex-col gap-0.5">
      <BaseText weight="semibold">{{ title }}</BaseText>
      <BaseText size="sm" tone="muted">{{ description }}</BaseText>
    </div>
    <div class="flex shrink-0">
      <slot />
    </div>
  </div>
</template>
