<script setup lang="ts">
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'

interface RoomSectionHeadingProps {
  title: string
  count: number
  description?: string
}

withDefaults(defineProps<RoomSectionHeadingProps>(), {
  description: undefined,
})
</script>

<template>
  <header class="flex flex-col gap-1">
    <div class="flex items-baseline gap-2">
      <BaseHeading :level="2" size="section">{{ title }}</BaseHeading>
      <BaseText as="span" size="sm" tone="subtle">{{ count }}</BaseText>
    </div>
    <BaseText v-if="description" size="sm" tone="muted">{{ description }}</BaseText>
  </header>
</template>
