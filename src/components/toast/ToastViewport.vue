<script setup lang="ts">
import { useToastStore } from '@/stores/toast-store'
import BaseToast from './BaseToast.vue'

const toastStore = useToastStore()

function handleDismissRequested(toastId: number) {
  toastStore.dismissToast(toastId)
}
</script>

<template>
  <section
    aria-label="Notifications"
    aria-live="polite"
    class="pointer-events-none fixed inset-x-4 bottom-24 z-20 sm:inset-x-auto sm:top-20 sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2"
  >
    <TransitionGroup
      tag="ol"
      class="flex flex-col items-stretch gap-2 sm:items-center"
      enter-active-class="transition duration-500 ease-bounce motion-reduce:transition-none"
      enter-from-class="translate-y-3 scale-95 opacity-0 sm:-translate-y-3"
      leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
      leave-to-class="scale-95 opacity-0"
      move-class="transition-transform duration-500 ease-bounce motion-reduce:transition-none"
    >
      <li v-for="toast in toastStore.visibleToasts" :key="toast.id" class="pointer-events-auto">
        <BaseToast :toast="toast" @dismiss-requested="handleDismissRequested(toast.id)" />
      </li>
    </TransitionGroup>
  </section>
</template>
