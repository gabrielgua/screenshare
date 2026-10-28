<script setup lang="ts">
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import { useNativeDialog } from '@/composables/use-native-dialog'
import { CloseIcon } from '@/theme/app-icons'

interface BaseDrawerProps {
  title: string
  isCloseBlocked?: boolean
}

const props = withDefaults(defineProps<BaseDrawerProps>(), {
  isCloseBlocked: false,
})

const isOpen = defineModel<boolean>('open', { default: false })

const { dialogElement, closeDialog, handleNativeCancel, handleBackdropClick } = useNativeDialog(
  isOpen,
  () => props.isCloseBlocked,
)
</script>

<template>
  <dialog
    ref="dialogElement"
    class="mx-0 mt-auto mb-0 h-4/5 max-h-none w-full max-w-none translate-y-full overflow-hidden rounded-t-card border-t border-neutral-200 bg-white p-0 text-neutral-900 shadow-card transition-all transition-discrete duration-150 ease-in backdrop:bg-neutral-950/0 backdrop:transition-all backdrop:transition-discrete backdrop:duration-200 open:translate-y-0 open:duration-200 open:ease-out open:backdrop:bg-neutral-950/60 starting:open:translate-y-full starting:open:backdrop:bg-neutral-950/0 motion-reduce:transition-none motion-reduce:backdrop:transition-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50"
    @cancel="handleNativeCancel"
    @click="handleBackdropClick"
  >
    <div class="flex h-full flex-col">
      <span
        class="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700"
        aria-hidden="true"
      />
      <div class="min-h-0 flex-1 overflow-y-auto">
        <div
          class="transition-all delay-200 duration-500 ease-bounce starting:translate-y-8 starting:opacity-0 motion-reduce:transition-none"
        >
          <div
            class="sticky top-0 z-10 flex flex-col gap-2 bg-white px-5 pt-2 pb-3 dark:bg-neutral-900"
          >
            <header class="flex items-center justify-between gap-4">
              <BaseHeading :level="2" size="subtitle" class="min-w-0 truncate">
                {{ title }}
              </BaseHeading>
              <BaseIconButton
                :icon="CloseIcon"
                accessible-label="Close"
                tooltip-placement="bottom"
                tooltip-alignment="end"
                variant="neutral"
                appearance="ghost"
                size="sm"
                :is-disabled="isCloseBlocked"
                class="-mr-2"
                @click="closeDialog"
              />
            </header>
            <slot name="header" />
          </div>
          <div class="px-5 pb-6">
            <slot :close-drawer="closeDialog" />
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>
