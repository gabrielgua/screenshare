<script setup lang="ts">
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { AddIcon, InviteLinkIcon, ShareScreenIcon } from '@/theme/app-icons'
import GettingStartedStep from './GettingStartedStep.vue'
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex flex-col gap-1">
      <BaseHeading :level="2" size="subtitle">How it works</BaseHeading>
      <BaseText size="sm" tone="muted">Three steps and your friends are watching.</BaseText>
    </div>
    <ol class="grid gap-3 md:grid-cols-3">
      <GettingStartedStep
        :step-number="1"
        :icon="AddIcon"
        title="Create a room"
        description="Give it a name. It stays yours, so you can come back anytime."
      />
      <GettingStartedStep
        :step-number="2"
        :icon="InviteLinkIcon"
        title="Share the link"
        description="Send it to your friends. They join with their Discord account."
      />
      <GettingStartedStep
        :step-number="3"
        :icon="ShareScreenIcon"
        title="Go live"
        description="Share a screen or a window. Everyone can share at the same time."
      />
    </ol>
  </section>
</template>
