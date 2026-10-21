<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import { CloseIcon } from '@/theme/app-icons'

interface BaseDialogProps {
  title: string
  isCloseBlocked?: boolean
}

const props = withDefaults(defineProps<BaseDialogProps>(), {
  isCloseBlocked: false,
})

const isOpen = defineModel<boolean>('open', { default: false })
const dialogElement = ref<HTMLDialogElement>()

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

function closeDialog() {
  if (!props.isCloseBlocked) {
    isOpen.value = false
  }
}

function handleNativeCancel(cancelEvent: Event) {
  cancelEvent.preventDefault()
  closeDialog()
}

function handleBackdropClick(clickEvent: MouseEvent) {
  if (clickEvent.target === dialogElement.value) {
    closeDialog()
  }
}
</script>

<template>
  <dialog
    ref="dialogElement"
    class="m-auto w-11/12 max-w-md rounded-card border border-neutral-200 bg-white p-0 text-neutral-900 shadow-card backdrop:bg-neutral-950/60 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
    @cancel="handleNativeCancel"
    @click="handleBackdropClick"
  >
    <div class="flex flex-col gap-5 p-5 sm:p-6">
      <header class="flex items-start justify-between gap-4">
        <BaseHeading :level="2" size="subtitle">{{ title }}</BaseHeading>
        <BaseIconButton
          :icon="CloseIcon"
          accessible-label="Close"
          variant="neutral"
          appearance="ghost"
          size="sm"
          :is-disabled="isCloseBlocked"
          class="-mt-1 -mr-2"
          @click="closeDialog"
        />
      </header>
      <slot />
      <footer class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <slot name="actions" />
      </footer>
    </div>
  </dialog>
</template>
