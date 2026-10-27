<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminPanelLink from '@/components/admin/AdminPanelLink.vue'
import AccountMenu from '@/components/authentication/AccountMenu.vue'
import SignedInUserAvatar from '@/components/authentication/SignedInUserAvatar.vue'
import ColorSchemeToggle from '@/components/theme/ColorSchemeToggle.vue'
import { isRunningInDesktopApp } from '@/media/desktop-bridge'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { HomeIcon, RoomIcon } from '@/theme/app-icons'
import AppBrandMark from './AppBrandMark.vue'
import AppMobileMenu from './AppMobileMenu.vue'
import HeaderNavigationLink from './HeaderNavigationLink.vue'

const authenticationStore = useAuthenticationStore()
const currentUserStore = useCurrentUserStore()
const route = useRoute()

const isDesktopApp = isRunningInDesktopApp()
const shouldSpanFullWidth = computed(() => isDesktopApp || route.meta.usesFullWidthLayout)
</script>

<template>
  <header
    class="window-drag-region window-controls-clearance sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
    :class="{ 'short-landscape:hidden': route.meta.usesFullWidthLayout }"
  >
    <div
      class="mx-auto flex h-16 items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6"
      :class="shouldSpanFullWidth ? 'max-w-none' : 'max-w-5xl'"
    >
      <AppBrandMark />
      <div v-if="authenticationStore.isSignedIn" class="hidden items-center gap-2 sm:flex">
        <HeaderNavigationLink :icon="HomeIcon" label="Home" :destination="{ name: 'home' }" />
        <HeaderNavigationLink
          v-if="currentUserStore.isApproved"
          :icon="RoomIcon"
          label="Rooms"
          :destination="{ name: 'rooms' }"
        />
        <AdminPanelLink v-if="currentUserStore.isAdmin" />
      </div>
      <div class="flex items-center gap-1 sm:gap-2">
        <template v-if="authenticationStore.isSignedIn">
          <div class="hidden sm:block">
            <AccountMenu />
          </div>
          <div class="flex items-center gap-1 sm:hidden">
            <SignedInUserAvatar size="sm" />
            <AppMobileMenu />
          </div>
        </template>
        <ColorSchemeToggle v-else />
      </div>
    </div>
  </header>
</template>
