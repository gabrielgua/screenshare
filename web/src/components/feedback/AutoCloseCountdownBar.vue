<script setup lang="ts">
import type { ActionFeedbackKind } from '@/stores/action-feedback-store'

interface AutoCloseCountdownBarProps {
  kind: ActionFeedbackKind
  durationInMilliseconds: number
}

defineProps<AutoCloseCountdownBarProps>()

const fillClassesByKind: Record<ActionFeedbackKind, string> = {
  success: 'bg-success-500 dark:bg-success-400',
  error: 'bg-danger-500 dark:bg-danger-400',
}
</script>

<template>
  <div
    class="h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
    aria-hidden="true"
  >
    <div
      class="h-full w-full origin-left animate-shrink-to-start rounded-full motion-reduce:animate-none"
      :class="fillClassesByKind[kind]"
      :style="{ animationDuration: `${durationInMilliseconds}ms` }"
    />
  </div>
</template>
