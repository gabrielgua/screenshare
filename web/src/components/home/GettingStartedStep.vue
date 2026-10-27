<script setup lang="ts">
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { AppIcon } from '@/theme/app-icons'

interface GettingStartedStepProps {
  stepNumber: number
  icon: AppIcon
  title: string
  description: string
}

defineProps<GettingStartedStepProps>()
</script>

<template>
  <li>
    <BaseCard class="flex h-full flex-col gap-3">
      <div class="flex items-center justify-between">
        <BaseIconCircle :icon="icon" size="sm" />
        <BaseText as="span" size="title" weight="bold" tone="subtle">{{ stepNumber }}</BaseText>
      </div>
      <div class="flex flex-col gap-1">
        <BaseText weight="semibold">{{ title }}</BaseText>
        <BaseText size="sm" tone="muted">{{ description }}</BaseText>
      </div>
    </BaseCard>
  </li>
</template>
