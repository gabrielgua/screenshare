<script setup lang="ts">
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { Toast, ToastTone } from '@/stores/toast-store'
import { CloseIcon } from '@/theme/app-icons'

interface BaseToastProps {
  toast: Toast
}

defineProps<BaseToastProps>()

const emit = defineEmits<{
  dismissRequested: []
}>()

const toneDotClassesByTone: Record<ToastTone, string> = {
  success: 'bg-success-500',
  neutral: 'bg-neutral-400 dark:bg-neutral-500',
}

function handleDismissButtonClick() {
  emit('dismissRequested')
}
</script>

<template>
  <div
    class="flex w-full items-center gap-3 rounded-card border border-neutral-200 bg-white p-3 shadow-card sm:w-80 dark:border-neutral-800 dark:bg-neutral-900"
  >
    <span class="relative inline-flex shrink-0">
      <BaseAvatar
        v-if="toast.person"
        :name="toast.person.name"
        :image-url="toast.person.imageUrl"
      />
      <span
        class="absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full ring-2 ring-white dark:ring-neutral-900"
        :class="toneDotClassesByTone[toast.tone]"
        aria-hidden="true"
      />
    </span>
    <div class="flex min-w-0 flex-1 flex-col">
      <BaseText size="sm" weight="semibold" class="truncate">{{ toast.title }}</BaseText>
      <BaseText v-if="toast.description" size="caption" tone="muted" class="truncate">
        {{ toast.description }}
      </BaseText>
    </div>
    <BaseIconButton
      :icon="CloseIcon"
      accessible-label="Dismiss"
      variant="neutral"
      appearance="ghost"
      size="sm"
      class="shrink-0"
      @click="handleDismissButtonClick"
    />
  </div>
</template>
