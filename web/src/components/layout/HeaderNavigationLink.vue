<script setup lang="ts">
import { useRouter, type RouteLocationRaw } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import type { AppIcon } from '@/theme/app-icons'

interface HeaderNavigationLinkProps {
  icon: AppIcon
  label: string
  destination: RouteLocationRaw
}

const props = defineProps<HeaderNavigationLinkProps>()

const router = useRouter()

function handleLinkClick() {
  router.push(props.destination)
}
</script>

<template>
  <BaseButton
    variant="neutral"
    appearance="ghost"
    :leading-icon="icon"
    :aria-label="label"
    @click="handleLinkClick"
  >
    <span class="hidden sm:inline">{{ label }}</span>
    <slot />
  </BaseButton>
</template>
