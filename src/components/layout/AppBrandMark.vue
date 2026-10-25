<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { ShareScreenIcon } from '@/theme/app-icons'

const APP_NAME = 'Screenshare'
</script>

<template>
  <RouterLink
    to="/"
    :aria-label="APP_NAME"
    class="flex shrink-0 items-center gap-2 rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
  >
    <span
      class="grid size-9 place-items-center rounded-control bg-brand-600 text-white dark:bg-brand-500"
    >
      <BaseIcon :icon="ShareScreenIcon" size="md" />
    </span>
    <BaseText as="span" size="lg" weight="bold">{{ APP_NAME }}</BaseText>
  </RouterLink>
</template>
