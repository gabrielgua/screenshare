<script setup lang="ts">
import BaseButton from '@/components/button/BaseButton.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import { DiscordIcon } from '@/theme/app-icons'
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <AppHeader />
    <PageContainer class="flex-1 justify-center">
      <div class="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        <BaseHeading :level="1">Share your screen with your Discord friends</BaseHeading>
        <BaseText size="lg" tone="muted">
          Go live from your browser and watch from any device, phone included.
        </BaseText>
        <div class="flex w-full flex-col pt-2 sm:w-auto">
          <BaseButton size="lg" :leading-icon="DiscordIcon" is-disabled>
            Sign in with Discord
          </BaseButton>
        </div>
        <BaseText size="sm" tone="subtle">
          Discord sign in arrives with the Supabase setup.
        </BaseText>
      </div>
    </PageContainer>
  </div>
</template>
