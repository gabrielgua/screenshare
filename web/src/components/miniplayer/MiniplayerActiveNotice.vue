<script setup lang="ts">
import BaseButton from '@/components/button/BaseButton.vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useMiniplayerStore } from '@/stores/miniplayer-store'
import { OpenMiniplayerIcon, ReturnFromMiniplayerIcon } from '@/theme/app-icons'

const miniplayerStore = useMiniplayerStore()

function handleBringBackButtonClick() {
  miniplayerStore.close()
}
</script>

<template>
  <div
    class="flex min-h-0 flex-1 animate-pop-in flex-col items-center justify-center gap-4 rounded-card border border-dashed border-neutral-300 p-6 text-center motion-reduce:animate-none dark:border-neutral-700"
  >
    <BaseIconCircle :icon="OpenMiniplayerIcon" />
    <div class="flex flex-col gap-1">
      <BaseText weight="semibold">Watching in the miniplayer</BaseText>
      <BaseText size="sm" tone="muted">
        The shared screens are playing in a floating window. You can keep using the app.
      </BaseText>
    </div>
    <BaseButton
      variant="neutral"
      appearance="outlined"
      :leading-icon="ReturnFromMiniplayerIcon"
      @click="handleBringBackButtonClick"
    >
      Bring them back
    </BaseButton>
  </div>
</template>
