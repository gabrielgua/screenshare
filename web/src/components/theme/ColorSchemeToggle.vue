<script setup lang="ts">
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import { useColorScheme } from '@/composables/use-color-scheme'
import type { ControlSize } from '@/theme/component-sizes'

interface ColorSchemeToggleProps {
  size?: ControlSize
}

withDefaults(defineProps<ColorSchemeToggleProps>(), {
  size: 'md',
})

const { switchColorSchemeIcon, switchColorSchemeLabel, toggleColorScheme } = useColorScheme()
</script>

<template>
  <BaseIconButton
    :icon="switchColorSchemeIcon"
    :accessible-label="switchColorSchemeLabel"
    :size="size"
    variant="neutral"
    appearance="ghost"
    @click="toggleColorScheme()"
  />
</template>
