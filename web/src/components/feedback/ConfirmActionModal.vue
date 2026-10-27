<script setup lang="ts">
import BaseButton from '@/components/button/BaseButton.vue'
import BaseModal from '@/components/dialog/BaseModal.vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { AppIcon } from '@/theme/app-icons'
import type { ColorVariant } from '@/theme/color-variants'

interface ConfirmActionModalProps {
  title: string
  description: string
  confirmLabel: string
  icon: AppIcon
  variant?: ColorVariant
  isSubmitting?: boolean
}

withDefaults(defineProps<ConfirmActionModalProps>(), {
  variant: 'primary',
  isSubmitting: false,
})

const emit = defineEmits<{
  confirmed: []
}>()

const isOpen = defineModel<boolean>('open', { default: false })

function handleCancelButtonClick() {
  isOpen.value = false
}

function handleConfirmButtonClick() {
  emit('confirmed')
}
</script>

<template>
  <BaseModal v-model:open="isOpen" width="compact" :is-close-blocked="isSubmitting">
    <div class="flex flex-col items-center gap-3 px-6 pt-8 pb-6 text-center">
      <BaseIconCircle
        :icon="icon"
        :variant="variant"
        size="lg"
        class="animate-pop-in motion-reduce:animate-none"
      />
      <BaseHeading :level="2" size="subtitle">{{ title }}</BaseHeading>
      <BaseText tone="muted">{{ description }}</BaseText>
      <div class="mt-3 grid w-full grid-cols-2 gap-3">
        <BaseButton
          variant="neutral"
          appearance="outlined"
          :is-disabled="isSubmitting"
          @click="handleCancelButtonClick"
        >
          Cancel
        </BaseButton>
        <BaseButton :variant="variant" :is-loading="isSubmitting" @click="handleConfirmButtonClick">
          {{ confirmLabel }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
