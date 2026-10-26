<script setup lang="ts">
import { computed } from 'vue'
import AccessDeniedNotice from '@/components/account-status/AccessDeniedNotice.vue'
import AccountDeactivatedNotice from '@/components/account-status/AccountDeactivatedNotice.vue'
import AccountLoadErrorNotice from '@/components/account-status/AccountLoadErrorNotice.vue'
import PendingApprovalNotice from '@/components/account-status/PendingApprovalNotice.vue'
import SignedInDashboard from '@/components/home/SignedInDashboard.vue'
import SignedOutHero from '@/components/home/SignedOutHero.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageLoadingSpinner from '@/components/layout/PageLoadingSpinner.vue'
import PageTransition from '@/components/layout/PageTransition.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCurrentUserStore } from '@/stores/current-user-store'

type HomeScreen =
  'loading' | 'signed-out' | 'load-error' | 'deactivated' | 'pending' | 'denied' | 'approved'

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
  if (currentUserStore.isDeactivated) {
    return 'deactivated'
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
  <PageContainer class="flex-1" :class="{ 'justify-center': visibleHomeScreen !== 'approved' }">
    <PageTransition>
      <PageLoadingSpinner
        v-if="visibleHomeScreen === 'loading'"
        accessible-label="Loading your account"
      />
      <SignedOutHero v-else-if="visibleHomeScreen === 'signed-out'" />
      <AccountLoadErrorNotice v-else-if="visibleHomeScreen === 'load-error'" />
      <AccountDeactivatedNotice v-else-if="visibleHomeScreen === 'deactivated'" />
      <PendingApprovalNotice v-else-if="visibleHomeScreen === 'pending'" />
      <AccessDeniedNotice v-else-if="visibleHomeScreen === 'denied'" />
      <SignedInDashboard v-else />
    </PageTransition>
  </PageContainer>
</template>
