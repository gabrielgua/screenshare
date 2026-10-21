<script setup lang="ts">
import { computed } from 'vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import { useColorScheme } from '@/composables/use-color-scheme'
import { DarkModeIcon, LightModeIcon } from '@/theme/app-icons'
import type { ControlSize } from '@/theme/component-sizes'

interface ColorSchemeToggleProps {
  size?: ControlSize
}

withDefaults(defineProps<ColorSchemeToggleProps>(), {
  size: 'md',
})

const { isDarkModeEnabled, toggleColorScheme } = useColorScheme()

const toggleIcon = computed(() => (isDarkModeEnabled.value ? LightModeIcon : DarkModeIcon))
const toggleLabel = computed(() =>
  isDarkModeEnabled.value ? 'Switch to light mode' : 'Switch to dark mode',
)
</script>

<template>
  <BaseIconButton
    :icon="toggleIcon"
    :accessible-label="toggleLabel"
    :size="size"
    variant="neutral"
    appearance="ghost"
    @click="toggleColorScheme()"
  />
</template>
