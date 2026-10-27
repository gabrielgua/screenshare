<script setup lang="ts">
import BaseHeading from '@/components/typography/BaseHeading.vue'

interface AccountStatusNoticeProps {
  title: string
}

defineProps<AccountStatusNoticeProps>()
</script>

<template>
  <section class="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-center">
    <slot name="illustration" />
    <BaseHeading :level="1" size="title">{{ title }}</BaseHeading>
    <div class="flex w-full flex-col items-center gap-4">
      <slot />
    </div>
  </section>
</template>
