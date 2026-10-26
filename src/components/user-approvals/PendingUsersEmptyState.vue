<script setup lang="ts">
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { SuccessIcon } from '@/theme/app-icons'
</script>

<template>
  <BaseCard class="flex flex-col items-center gap-3 py-10 text-center">
    <BaseIconCircle :icon="SuccessIcon" variant="success" />
    <BaseText weight="semibold">You are all caught up</BaseText>
    <BaseText size="sm" tone="muted">Nobody is waiting for approval right now.</BaseText>
  </BaseCard>
</template>
