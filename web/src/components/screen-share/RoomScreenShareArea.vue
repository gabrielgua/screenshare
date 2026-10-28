<script setup lang="ts">
import { computed } from 'vue'
import MiniplayerActiveNotice from '@/components/miniplayer/MiniplayerActiveNotice.vue'
import type { RoomScreenShare } from '@/composables/use-room-screen-sharing'
import { useMiniplayerStore } from '@/stores/miniplayer-store'
import RoomControlBar from './RoomControlBar.vue'
import ScreenShareStage from './ScreenShareStage.vue'

interface RoomScreenShareAreaProps {
  screenShares: RoomScreenShare[]
}

const props = defineProps<RoomScreenShareAreaProps>()

const miniplayerStore = useMiniplayerStore()

const stageScreenShares = computed(() =>
  props.screenShares.filter((screenShare) => !miniplayerStore.containsShare(screenShare.userId)),
)
const isEveryShareInTheMiniplayer = computed(
  () => props.screenShares.length > 0 && stageScreenShares.value.length === 0,
)
</script>

<template>
  <div class="flex min-h-0 min-w-0 flex-1 flex-col gap-3 short-landscape:gap-2">
    <MiniplayerActiveNotice v-if="isEveryShareInTheMiniplayer" />
    <ScreenShareStage v-else :screen-shares="stageScreenShares" />
    <RoomControlBar :screen-shares="screenShares" />
  </div>
</template>
