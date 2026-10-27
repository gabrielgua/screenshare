<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { AppIcon } from '@/theme/app-icons'

interface SignedInUserProfileDetailProps {
  icon: AppIcon
  text: string
}

defineProps<SignedInUserProfileDetailProps>()
</script>

<template>
  <div class="flex min-w-0 items-center gap-2 text-neutral-500 dark:text-neutral-400">
    <BaseIcon :icon="icon" size="sm" class="shrink-0" />
    <BaseText as="span" size="sm" tone="muted" class="truncate">{{ text }}</BaseText>
  </div>
</template>
