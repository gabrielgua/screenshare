<script setup lang="ts">
import { ref, watch } from 'vue'

export type ModalWidth = 'compact' | 'regular'

interface BaseModalProps {
  width?: ModalWidth
  isCloseBlocked?: boolean
}

const props = withDefaults(defineProps<BaseModalProps>(), {
  width: 'regular',
  isCloseBlocked: false,
})

const isOpen = defineModel<boolean>('open', { default: false })
const dialogElement = ref<HTMLDialogElement>()

const widthClassesByWidth: Record<ModalWidth, string> = {
  compact: 'max-w-sm',
  regular: 'max-w-md',
}

watch(
  [isOpen, dialogElement],
  ([shouldBeOpen, element]) => {
    if (!element) {
      return
    }
    if (shouldBeOpen && !element.open) {
      element.showModal()
    }
    if (!shouldBeOpen && element.open) {
      element.close()
    }
  },
  { immediate: true },
)

function closeModal() {
  if (!props.isCloseBlocked) {
    isOpen.value = false
  }
}

function handleNativeCancel(cancelEvent: Event) {
  cancelEvent.preventDefault()
  closeModal()
}

function handleBackdropClick(clickEvent: MouseEvent) {
  if (clickEvent.target === dialogElement.value) {
    closeModal()
  }
}
</script>

<template>
  <dialog
    ref="dialogElement"
    class="m-auto w-11/12 translate-y-4 scale-90 rounded-card border border-neutral-200 bg-white p-0 text-neutral-900 opacity-0 shadow-card transition-all transition-discrete duration-150 ease-in backdrop:bg-neutral-950/0 backdrop:transition-all backdrop:transition-discrete backdrop:duration-200 open:translate-y-0 open:scale-100 open:opacity-100 open:duration-300 open:ease-bounce open:backdrop:bg-neutral-950/60 starting:open:translate-y-4 starting:open:scale-90 starting:open:opacity-0 starting:open:backdrop:bg-neutral-950/0 motion-reduce:transition-none motion-reduce:backdrop:transition-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
    :class="widthClassesByWidth[width]"
    @cancel="handleNativeCancel"
    @click="handleBackdropClick"
  >
    <slot :close-modal="closeModal" />
  </dialog>
</template>
