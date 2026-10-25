<script setup lang="ts">
import BaseButton from '@/components/button/BaseButton.vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { SearchIcon } from '@/theme/app-icons'

interface NoMatchingResultsProps {
  title: string
}

defineProps<NoMatchingResultsProps>()

const emit = defineEmits<{
  clearFiltersRequested: []
}>()

function handleClearFiltersButtonClick() {
  emit('clearFiltersRequested')
}
</script>

<template>
  <BaseCard class="flex flex-col items-center gap-3 py-10 text-center">
    <BaseIconCircle :icon="SearchIcon" variant="neutral" />
    <BaseText weight="semibold">{{ title }}</BaseText>
    <BaseText size="sm" tone="muted">Try another search or clear the filters.</BaseText>
    <BaseButton variant="neutral" appearance="outlined" @click="handleClearFiltersButtonClick">
      Clear filters
    </BaseButton>
  </BaseCard>
</template>
