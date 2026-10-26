<script setup lang="ts">
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import RoomControlBar from './RoomControlBar.vue'
import ScreenShareStage from './ScreenShareStage.vue'

interface RoomScreenShareAreaProps {
  screenShares: RoomScreenShare[]
}

defineProps<RoomScreenShareAreaProps>()
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col gap-3 lg:min-h-0">
    <ScreenShareStage :screen-shares="screenShares" />
    <RoomControlBar />
  </div>
</template>
