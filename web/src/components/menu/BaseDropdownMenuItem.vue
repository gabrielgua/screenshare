<script setup lang="ts">
import BaseButton from '@/components/button/BaseButton.vue'
import type { AppIcon } from '@/theme/app-icons'

export type DropdownMenuItemTone = 'neutral' | 'danger'

interface BaseDropdownMenuItemProps {
  icon: AppIcon
  tone?: DropdownMenuItemTone
}

withDefaults(defineProps<BaseDropdownMenuItemProps>(), {
  tone: 'neutral',
})

const emit = defineEmits<{
  selected: []
}>()

function handleItemClick() {
  emit('selected')
}
</script>

<template>
  <BaseButton
    role="menuitem"
    :variant="tone"
    appearance="ghost"
    :leading-icon="icon"
    content-alignment="start"
    is-full-width
    @click="handleItemClick"
  >
    <slot />
  </BaseButton>
</template>
