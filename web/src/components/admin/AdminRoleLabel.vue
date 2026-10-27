<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { AdminBadgeIcon } from '@/theme/app-icons'
</script>

<template>
  <BaseText as="span" size="caption" weight="semibold" tone="brand" class="flex items-center gap-1">
    <BaseIcon :icon="AdminBadgeIcon" size="md" />
    (Admin)
  </BaseText>
</template>
