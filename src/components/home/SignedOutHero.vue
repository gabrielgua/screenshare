<script setup lang="ts">
import DiscordSignInButton from '@/components/authentication/DiscordSignInButton.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
</script>

<template>
  <section class="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
    <BaseHeading :level="1">Share your screen with your Discord friends</BaseHeading>
    <BaseText size="lg" tone="muted">
      Go live from your browser and watch from any device, phone included.
    </BaseText>
    <div class="flex w-full justify-center pt-2">
      <DiscordSignInButton />
    </div>
  </section>
</template>
