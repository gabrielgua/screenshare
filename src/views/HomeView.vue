<script setup lang="ts">
import SignedInWelcome from '@/components/home/SignedInWelcome.vue'
import SignedOutHero from '@/components/home/SignedOutHero.vue'
import BaseSpinner from '@/components/icon/BaseSpinner.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'

const authenticationStore = useAuthenticationStore()
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <AppHeader />
    <PageContainer class="flex-1 justify-center">
      <BaseSpinner
        v-if="authenticationStore.isRestoringSession"
        size="xl"
        accessible-label="Restoring your session"
        class="mx-auto text-brand-600 dark:text-brand-400"
      />
      <SignedInWelcome v-else-if="authenticationStore.isSignedIn" />
      <SignedOutHero v-else />
    </PageContainer>
  </div>
</template>
