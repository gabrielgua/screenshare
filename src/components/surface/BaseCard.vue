<script setup lang="ts">
export type CardPadding = 'compact' | 'comfortable'

interface BaseCardProps {
  as?: 'div' | 'section' | 'article'
  padding?: CardPadding
}

withDefaults(defineProps<BaseCardProps>(), {
  as: 'div',
  padding: 'comfortable',
})

const cardPaddingClasses: Record<CardPadding, string> = {
  compact: 'p-4',
  comfortable: 'p-4 sm:p-6',
}
</script>

<template>
  <component
    :is="as"
    :class="[
      'rounded-card border border-neutral-200 bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900',
      cardPaddingClasses[padding],
    ]"
  >
    <slot />
  </component>
</template>
