<script setup lang="ts">
import BaseSpinner from '@/components/icon/BaseSpinner.vue'

interface PageLoadingSpinnerProps {
  accessibleLabel: string
}

defineProps<PageLoadingSpinnerProps>()
</script>

<template>
  <BaseSpinner
    size="xl"
    :accessible-label="accessibleLabel"
    class="mx-auto py-10 text-brand-600 dark:text-brand-400"
  />
</template>
