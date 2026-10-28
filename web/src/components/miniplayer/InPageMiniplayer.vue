<script setup lang="ts">
import { ref } from 'vue'
import MiniplayerWindowHeader from './MiniplayerWindowHeader.vue'

interface InPageMiniplayerProps {
  title: string
  contentWidth: number
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

function handleCloseRequested() {
  emit('closeRequested')
}
</script>

<template>
  <section
    aria-label="Miniplayer"
    class="fixed right-4 bottom-4 z-40 animate-pop-in overflow-hidden bg-neutral-950 shadow-card motion-reduce:animate-none"
    :style="{
      transform: `translate(${panelOffset.horizontal}px, ${panelOffset.vertical}px)`,
    }"
  >
    <div
      class="flex flex-col transition-all duration-500 ease-bounce motion-reduce:transition-none"
      :style="{ width: `${contentWidth}px`, height: `${contentHeight}px` }"
    >
      <MiniplayerWindowHeader
        :title="title"
        can-close
        class="touch-none"
        :class="isMovingPanel ? 'cursor-grabbing' : 'cursor-grab'"
        @pointerdown="handleHeaderPointerDown"
        @pointermove="handleHeaderPointerMove"
        @pointerup="handleHeaderPointerUp"
        @pointercancel="handleHeaderPointerUp"
        @close-requested="handleCloseRequested"
      />
      <div class="min-h-0 flex-1">
        <slot />
      </div>
    </div>
  </section>
</template>
