<script setup lang="ts">
import Icon from '@/components/Icon.vue'
import { useAppStore } from '@/stores/app-store'
import { ComputerScreenShareIcon } from '@hugeicons/core-free-icons'
import { useDateFormat, useNow } from '@vueuse/core'

const appStore = useAppStore()
const time = useDateFormat(useNow(), 'HH:mm:ss')
</script>

<template>
  <main class="grid min-h-dvh place-items-center p-6">
    <div class="flex flex-col items-center gap-4 text-center">
      <div class="icon-badge">
        <Icon :icon="ComputerScreenShareIcon" :size="32" />
      </div>
      <h1 class="text-5xl font-extrabold tracking-tight sm:text-6xl">{{ appStore.greeting }}</h1>
      <p class="text-slate-500">screenshare · {{ time }}</p>
    </div>
  </main>
</template>

<style scoped>
.icon-badge {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  color: var(--color-accent);
  background-color: color-mix(in oklab, var(--color-accent) 12%, white);
}
</style>
