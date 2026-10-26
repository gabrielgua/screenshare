<script setup lang="ts">
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'

interface AdminPageHeadingProps {
  title: string
  description: string
}

defineProps<AdminPageHeadingProps>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <BaseHeading :level="1" size="title">{{ title }}</BaseHeading>
    <BaseText tone="muted">{{ description }}</BaseText>
  </div>
</template>
