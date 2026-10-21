<script setup lang="ts">
import SignedInUserMenu from '@/components/authentication/SignedInUserMenu.vue'
import ColorSchemeToggle from '@/components/theme/ColorSchemeToggle.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'
import AppBrandMark from './AppBrandMark.vue'

const authenticationStore = useAuthenticationStore()
</script>

<template>
  <header
    class="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
  >
    <div class="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
      <AppBrandMark />
      <div class="flex items-center gap-2">
        <ColorSchemeToggle />
        <SignedInUserMenu v-if="authenticationStore.isSignedIn" />
      </div>
    </div>
  </header>
</template>
