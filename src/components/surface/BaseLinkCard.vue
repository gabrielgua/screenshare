<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import { ArrowRightIcon } from '@/theme/app-icons'
import BaseCard from './BaseCard.vue'

interface BaseLinkCardProps {
  destination: RouteLocationRaw
}

defineProps<BaseLinkCardProps>()
</script>

<template>
  <RouterLink
    :to="destination"
    class="group block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
  >
    <BaseCard
      as="article"
      padding="compact"
      class="flex items-center gap-3 transition-colors duration-150 group-hover:border-brand-300 dark:group-hover:border-brand-700"
    >
      <slot name="leading" />
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <slot />
      </div>
      <BaseIcon
        :icon="ArrowRightIcon"
        size="md"
        class="shrink-0 text-neutral-400 transition-transform duration-150 group-hover:translate-x-0.5 dark:text-neutral-500"
      />
    </BaseCard>
  </RouterLink>
</template>
