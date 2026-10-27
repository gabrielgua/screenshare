<script setup lang="ts">
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'

interface AdminDetailsSectionProps {
  title: string
  description?: string
}

withDefaults(defineProps<AdminDetailsSectionProps>(), {
  description: undefined,
})
</script>

<template>
  <BaseCard as="section" class="flex flex-col gap-4">
    <header class="flex flex-col gap-1">
      <BaseHeading :level="2" size="section">{{ title }}</BaseHeading>
      <BaseText v-if="description" size="sm" tone="muted">{{ description }}</BaseText>
    </header>
    <slot />
  </BaseCard>
</template>
