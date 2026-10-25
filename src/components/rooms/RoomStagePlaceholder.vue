<script setup lang="ts">
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { ShareScreenIcon } from '@/theme/app-icons'
</script>

<template>
  <section
    aria-label="Screen sharing"
    class="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-neutral-300 bg-neutral-100 p-6 text-center dark:border-neutral-700 dark:bg-neutral-900"
  >
    <BaseIconCircle :icon="ShareScreenIcon" size="lg" />
    <BaseText weight="semibold">Screen sharing is coming soon</BaseText>
    <BaseText size="sm" tone="muted" class="max-w-sm">
      Shared screens will show up here, with sound controls for each one.
    </BaseText>
  </section>
</template>
