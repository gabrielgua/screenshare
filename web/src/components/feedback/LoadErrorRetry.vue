<script setup lang="ts">
import BaseButton from '@/components/button/BaseButton.vue'
import BaseText from '@/components/typography/BaseText.vue'

interface LoadErrorRetryProps {
  errorMessage: string
}

defineProps<LoadErrorRetryProps>()

const emit = defineEmits<{
  retryRequested: []
}>()

function handleRetryButtonClick() {
  emit('retryRequested')
}
</script>

<template>
  <div class="flex flex-col items-center gap-3 py-10 text-center">
    <BaseText tone="danger" role="alert">{{ errorMessage }}</BaseText>
    <BaseButton variant="neutral" appearance="outlined" @click="handleRetryButtonClick">
      Try again
    </BaseButton>
  </div>
</template>
