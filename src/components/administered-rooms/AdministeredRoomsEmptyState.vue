<script setup lang="ts">
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { RoomIcon } from '@/theme/app-icons'
</script>

<template>
  <BaseCard class="flex flex-col items-center gap-3 py-10 text-center">
    <BaseIconCircle :icon="RoomIcon" variant="neutral" />
    <BaseText weight="semibold">No rooms yet</BaseText>
    <BaseText size="sm" tone="muted">Rooms show up here as soon as someone creates one.</BaseText>
  </BaseCard>
</template>
