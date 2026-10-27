<script setup lang="ts">
export type PageContainerWidth = 'regular' | 'full'

interface PageContainerProps {
  width?: PageContainerWidth
}

withDefaults(defineProps<PageContainerProps>(), {
  width: 'regular',
})

const layoutClassesByWidth: Record<PageContainerWidth, string> = {
  regular: 'max-w-5xl gap-6 py-6 sm:gap-8 sm:py-10',
  full: 'max-w-none gap-4 py-4 sm:py-6 short-landscape:gap-2 short-landscape:py-2',
}
</script>

<template>
  <main class="mx-auto flex w-full flex-col px-4 sm:px-6" :class="layoutClassesByWidth[width]">
    <slot />
  </main>
</template>
