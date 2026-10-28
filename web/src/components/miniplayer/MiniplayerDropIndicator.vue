<script setup lang="ts">
import type { MiniplayerDropEdge } from '@/stores/miniplayer-store'

interface MiniplayerDropIndicatorProps {
  edge: MiniplayerDropEdge
}

defineProps<MiniplayerDropIndicatorProps>()

const positionClassesByEdge: Record<MiniplayerDropEdge, string> = {
  left: 'inset-y-2 left-0 w-1.5',
  right: 'inset-y-2 right-0 w-1.5',
  top: 'inset-x-2 top-0 h-1.5',
  bottom: 'inset-x-2 bottom-0 h-1.5',
}
</script>

<template>
  <span
    class="pointer-events-none absolute z-10 animate-pop-in rounded-full bg-brand-500 shadow-card ring-4 ring-brand-500/30 motion-reduce:animate-none"
    :class="positionClassesByEdge[edge]"
    aria-hidden="true"
  />
</template>
