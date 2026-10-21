<script setup lang="ts">
import { HelpCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

type HugeIcon = typeof HelpCircleIcon

withDefaults(
  defineProps<{
    icon?: HugeIcon
    size?: number
  }>(),
  {
    icon: () => HelpCircleIcon,
    size: 18,
  },
)
</script>

<template>
  <HugeiconsIcon :icon="icon" :size="size" v-bind="$attrs" />
</template>
