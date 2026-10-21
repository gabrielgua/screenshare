<script setup lang="ts">
import BaseText from '@/components/typography/BaseText.vue'

interface UserDetailsInformationRowProps {
  label: string
}

defineProps<UserDetailsInformationRowProps>()
</script>

<template>
  <div
    class="flex flex-col gap-1 border-t border-neutral-100 py-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-start sm:gap-6 dark:border-neutral-800"
  >
    <dt class="sm:w-44 sm:shrink-0">
      <BaseText as="span" size="sm" weight="medium" tone="subtle">{{ label }}</BaseText>
    </dt>
    <dd class="min-w-0 flex-1">
      <BaseText as="div" size="sm">
        <slot />
      </BaseText>
    </dd>
  </div>
</template>
