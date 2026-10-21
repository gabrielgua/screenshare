<script setup lang="ts">
import { computed } from 'vue'
import AccessDeniedNotice from '@/components/account-status/AccessDeniedNotice.vue'
import AccountLoadErrorNotice from '@/components/account-status/AccountLoadErrorNotice.vue'
import PendingApprovalNotice from '@/components/account-status/PendingApprovalNotice.vue'
import SignedInWelcome from '@/components/home/SignedInWelcome.vue'
import SignedOutHero from '@/components/home/SignedOutHero.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageLoadingSpinner from '@/components/layout/PageLoadingSpinner.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCurrentUserStore } from '@/stores/current-user-store'

type HomeScreen = 'loading' | 'signed-out' | 'load-error' | 'pending' | 'denied' | 'approved'

const authenticationStore = useAuthenticationStore()
const currentUserStore = useCurrentUserStore()

const visibleHomeScreen = computed<HomeScreen>(() => {
  if (authenticationStore.isRestoringSession) {
    return 'loading'
  }
  if (!authenticationStore.isSignedIn) {
    return 'signed-out'
  }
  if (!currentUserStore.hasResolvedCurrentUser) {
    return 'loading'
  }
  if (!currentUserStore.currentUser) {
    return 'load-error'
  }
  if (currentUserStore.isPendingApproval) {
    return 'pending'
  }
  if (currentUserStore.isDenied) {
    return 'denied'
  }
  return 'approved'
})
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <AppHeader />
    <PageContainer class="flex-1 justify-center">
      <PageLoadingSpinner
        v-if="visibleHomeScreen === 'loading'"
        accessible-label="Loading your account"
      />
      <SignedOutHero v-else-if="visibleHomeScreen === 'signed-out'" />
      <AccountLoadErrorNotice v-else-if="visibleHomeScreen === 'load-error'" />
      <PendingApprovalNotice v-else-if="visibleHomeScreen === 'pending'" />
      <AccessDeniedNotice v-else-if="visibleHomeScreen === 'denied'" />
      <SignedInWelcome v-else />
    </PageContainer>
  </div>
</template>
