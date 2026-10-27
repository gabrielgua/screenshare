<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'
import BaseBadge from '@/components/badge/BaseBadge.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import type { AppIcon } from '@/theme/app-icons'

interface AdminNavigationTabProps {
  destination: RouteLocationRaw
  label: string
  icon: AppIcon
  badgeCount?: number
}

const props = withDefaults(defineProps<AdminNavigationTabProps>(), {
  badgeCount: 0,
})

const route = useRoute()
const router = useRouter()

const destinationPath = computed(() => router.resolve(props.destination).path)
const isTabActive = computed(
  () => route.path === destinationPath.value || route.path.startsWith(`${destinationPath.value}/`),
)
</script>

<template>
  <RouterLink v-slot="{ href, navigate }" :to="destination" custom>
    <a
      :href="href"
      :aria-current="isTabActive ? 'page' : undefined"
      class="flex h-10 flex-1 items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:h-9 sm:flex-none"
      :class="{
        'bg-white text-neutral-900 shadow-card dark:bg-neutral-800 dark:text-neutral-50':
          isTabActive,
        'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100':
          !isTabActive,
      }"
      @click="navigate"
    >
      <BaseIcon :icon="icon" size="sm" />
      {{ label }}
      <BaseBadge v-if="badgeCount > 0" variant="danger">{{ badgeCount }}</BaseBadge>
    </a>
  </RouterLink>
</template>
