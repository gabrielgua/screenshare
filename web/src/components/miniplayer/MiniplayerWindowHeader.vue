<script setup lang="ts">
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { CloseIcon } from '@/theme/app-icons'

interface MiniplayerWindowHeaderProps {
  title: string
  canClose?: boolean
}

withDefaults(defineProps<MiniplayerWindowHeaderProps>(), {
  canClose: false,
})

const emit = defineEmits<{
  closeRequested: []
}>()

function handleCloseButtonClick() {
  emit('closeRequested')
}
</script>

<template>
  <header
    class="window-drag-region window-controls-clearance flex h-8 shrink-0 items-center gap-2 bg-neutral-50 pl-3 select-none dark:bg-neutral-950"
  >
    <BaseText as="span" size="caption" weight="semibold" class="min-w-0 flex-1 truncate">
      {{ title }}
    </BaseText>
    <BaseIconButton
      v-if="canClose"
      :icon="CloseIcon"
      accessible-label="Close the miniplayer"
      tooltip-placement="bottom"
      tooltip-alignment="end"
      variant="neutral"
      appearance="ghost"
      size="sm"
      class="mr-0.5"
      @click="handleCloseButtonClick"
    />
  </header>
</template>
