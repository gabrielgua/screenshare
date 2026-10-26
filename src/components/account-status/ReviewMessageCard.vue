<script setup lang="ts">
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseText from '@/components/typography/BaseText.vue'

interface ReviewMessageCardProps {
  label: string
  message: string
}

defineProps<ReviewMessageCardProps>()
</script>

<template>
  <BaseCard padding="compact" class="w-full text-left">
    <BaseText size="caption" weight="semibold" tone="subtle" class="uppercase tracking-wide">
      {{ label }}
    </BaseText>
    <BaseText class="pt-1 whitespace-pre-line">{{ message }}</BaseText>
  </BaseCard>
</template>
