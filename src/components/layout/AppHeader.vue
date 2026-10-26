<script setup lang="ts">
import { useRoute } from 'vue-router'
import AdminPanelLink from '@/components/admin/AdminPanelLink.vue'
import SignedInUserMenu from '@/components/authentication/SignedInUserMenu.vue'
import ColorSchemeToggle from '@/components/theme/ColorSchemeToggle.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import AppBrandMark from './AppBrandMark.vue'
import AppMobileMenu from './AppMobileMenu.vue'
import HomeLink from './HomeLink.vue'
import SignOutButton from '../authentication/SignOutButton.vue'

const authenticationStore = useAuthenticationStore()
const currentUserStore = useCurrentUserStore()
const route = useRoute()
</script>

<template>
  <header
    class="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
    :class="{ 'short-landscape:hidden': route.meta.usesFullWidthLayout }"
  >
    <div
      class="mx-auto flex h-16 items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6"
      :class="route.meta.usesFullWidthLayout ? 'max-w-none' : 'max-w-5xl'"
    >
      <AppBrandMark />
      <div v-if="authenticationStore.isSignedIn" class="hidden items-center gap-2 sm:flex">
        <HomeLink />
        <AdminPanelLink v-if="currentUserStore.isAdmin" />
      </div>
      <div class="flex items-center gap-1 sm:gap-2">
        <SignedInUserMenu v-if="authenticationStore.isSignedIn" />
        <div
          class="items-center gap-2"
          :class="authenticationStore.isSignedIn ? 'hidden sm:flex' : 'flex'"
        >
          <ColorSchemeToggle />
          <SignOutButton v-if="authenticationStore.isSignedIn" />
        </div>
        <div v-if="authenticationStore.isSignedIn" class="flex sm:hidden">
          <AppMobileMenu />
        </div>
      </div>
    </div>
  </header>
</template>
