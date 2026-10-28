<script setup lang="ts">
import { ref } from 'vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { CloseIcon, DragHandleIcon } from '@/theme/app-icons'

interface InPageMiniplayerProps {
  contentHeight: number
}

interface PanelOffset {
  horizontal: number
  vertical: number
}

defineProps<InPageMiniplayerProps>()

const emit = defineEmits<{
  closeRequested: []
}>()

const panelOffset = ref<PanelOffset>({ horizontal: 0, vertical: 0 })
const isMovingPanel = ref(false)
let moveStart: { pointerX: number; pointerY: number; offset: PanelOffset } | undefined

function handleHeaderPointerDown(pointerEvent: PointerEvent) {
  const pressedElement = pointerEvent.target
  if (pressedElement instanceof Element && pressedElement.closest('button')) {
    return
  }
  moveStart = {
    pointerX: pointerEvent.clientX,
    pointerY: pointerEvent.clientY,
    offset: { ...panelOffset.value },
  }
  isMovingPanel.value = true
  ;(pointerEvent.currentTarget as HTMLElement).setPointerCapture(pointerEvent.pointerId)
}

function handleHeaderPointerMove(pointerEvent: PointerEvent) {
  if (!moveStart) {
    return
  }
  panelOffset.value = {
    horizontal: moveStart.offset.horizontal + pointerEvent.clientX - moveStart.pointerX,
    vertical: moveStart.offset.vertical + pointerEvent.clientY - moveStart.pointerY,
  }
}

function handleHeaderPointerUp() {
  moveStart = undefined
  isMovingPanel.value = false
}

function handleCloseButtonClick() {
  emit('closeRequested')
}
</script>

<template>
  <section
    aria-label="Miniplayer"
    class="fixed right-4 bottom-4 z-40 flex w-96 animate-pop-in flex-col overflow-hidden rounded-card border border-neutral-200 bg-white shadow-card motion-reduce:animate-none dark:border-neutral-800 dark:bg-neutral-900"
    :style="{
      transform: `translate(${panelOffset.horizontal}px, ${panelOffset.vertical}px)`,
    }"
  >
    <header
      class="flex touch-none items-center gap-2 border-b border-neutral-200 py-1 pr-1 pl-3 select-none dark:border-neutral-800"
      :class="isMovingPanel ? 'cursor-grabbing' : 'cursor-grab'"
      @pointerdown="handleHeaderPointerDown"
      @pointermove="handleHeaderPointerMove"
      @pointerup="handleHeaderPointerUp"
      @pointercancel="handleHeaderPointerUp"
    >
      <BaseIcon :icon="DragHandleIcon" size="sm" class="text-neutral-400" />
      <BaseText as="span" size="sm" weight="semibold" class="flex-1">Miniplayer</BaseText>
      <BaseIconButton
        :icon="CloseIcon"
        accessible-label="Close the miniplayer"
        tooltip-placement="top"
        tooltip-alignment="end"
        variant="neutral"
        appearance="ghost"
        size="sm"
        @click="handleCloseButtonClick"
      />
    </header>
    <div
      class="bg-neutral-100 transition-all duration-500 ease-bounce motion-reduce:transition-none dark:bg-neutral-950"
      :style="{ height: `${contentHeight}px` }"
    >
      <slot />
    </div>
  </section>
</template>
