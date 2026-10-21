<script setup lang="ts">
import AdminPanelLink from '@/components/admin/AdminPanelLink.vue'
import SignedInUserMenu from '@/components/authentication/SignedInUserMenu.vue'
import ColorSchemeToggle from '@/components/theme/ColorSchemeToggle.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import AppBrandMark from './AppBrandMark.vue'
import HomeLink from './HomeLink.vue'
import SignOutButton from '../authentication/SignOutButton.vue'

const authenticationStore = useAuthenticationStore()
const currentUserStore = useCurrentUserStore()
</script>

<template>
  <header
    class="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
  >
    <div
      class="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6"
    >
      <AppBrandMark />
      <div v-if="authenticationStore.isSignedIn" class="flex items-center gap-1 sm:gap-2">
        <HomeLink />
        <AdminPanelLink v-if="currentUserStore.isAdmin" />
      </div>
      <div class="flex items-center gap-1 sm:gap-2">
        <SignedInUserMenu v-if="authenticationStore.isSignedIn" />
        <ColorSchemeToggle />
        <SignOutButton v-if="authenticationStore.isSignedIn" />
      </div>
    </div>
  </header>
</template>
