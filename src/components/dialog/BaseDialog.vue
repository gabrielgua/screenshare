<script setup lang="ts">
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import { CloseIcon } from '@/theme/app-icons'
import BaseModal, { type ModalWidth } from './BaseModal.vue'

interface BaseDialogProps {
  title: string
  isCloseBlocked?: boolean
  width?: ModalWidth
}

withDefaults(defineProps<BaseDialogProps>(), {
  isCloseBlocked: false,
  width: 'regular',
})

const isOpen = defineModel<boolean>('open', { default: false })
</script>

<template>
  <BaseModal
    v-slot="{ closeModal }"
    v-model:open="isOpen"
    :width="width"
    :is-close-blocked="isCloseBlocked"
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
          @click="closeModal"
        />
      </header>
      <slot />
      <footer v-if="$slots.actions" class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <slot name="actions" />
      </footer>
    </div>
  </BaseModal>
</template>
