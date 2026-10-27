<script setup lang="ts">
import { ref } from 'vue'
import AdminRoleLabel from '@/components/admin/AdminRoleLabel.vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseDropdownMenu from '@/components/menu/BaseDropdownMenu.vue'
import BaseDropdownMenuItem from '@/components/menu/BaseDropdownMenuItem.vue'
import { useColorScheme } from '@/composables/use-color-scheme'
import { canInstallDesktopApp, openDesktopAppDownload } from '@/media/desktop-bridge'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { DownloadIcon, OpenMenuIcon, SignOutIcon } from '@/theme/app-icons'
import SignedInUserAvatar from './SignedInUserAvatar.vue'
import SignedInUserProfileSummary from './SignedInUserProfileSummary.vue'

const authenticationStore = useAuthenticationStore()
const currentUserStore = useCurrentUserStore()
const { switchColorSchemeIcon, switchColorSchemeLabel, toggleColorScheme } = useColorScheme()

const isMenuOpen = ref(false)
const shouldOfferDesktopApp = canInstallDesktopApp()

function handleColorSchemeSelected() {
  toggleColorScheme()
}

function handleDesktopAppSelected() {
  isMenuOpen.value = false
  openDesktopAppDownload()
}

function handleSignOutSelected() {
  isMenuOpen.value = false
  authenticationStore.signOut()
}
</script>

<template>
  <BaseDropdownMenu v-model:open="isMenuOpen" accessible-label="Your account">
    <template #trigger="{ isOpen, menuId, toggleMenu }">
      <BaseButton
        variant="neutral"
        appearance="ghost"
        :trailing-icon="OpenMenuIcon"
        aria-haspopup="menu"
        :aria-expanded="isOpen"
        :aria-controls="menuId"
        @click="toggleMenu"
      >
        <span class="flex min-w-0 items-center gap-2">
          <SignedInUserAvatar size="sm" />
          <span class="max-w-40 truncate">{{ authenticationStore.displayName }}</span>
          <AdminRoleLabel v-if="currentUserStore.isAdmin" />
        </span>
      </BaseButton>
    </template>
    <div class="border-b border-neutral-200 p-4 dark:border-neutral-800">
      <SignedInUserProfileSummary />
    </div>
    <div class="flex flex-col gap-1 p-2">
      <BaseDropdownMenuItem :icon="switchColorSchemeIcon" @selected="handleColorSchemeSelected">
        {{ switchColorSchemeLabel }}
      </BaseDropdownMenuItem>
      <BaseDropdownMenuItem
        v-if="shouldOfferDesktopApp"
        :icon="DownloadIcon"
        @selected="handleDesktopAppSelected"
      >
        Get the Windows app
      </BaseDropdownMenuItem>
    </div>
    <div class="border-t border-neutral-200 p-2 dark:border-neutral-800">
      <BaseDropdownMenuItem :icon="SignOutIcon" tone="danger" @selected="handleSignOutSelected">
        Sign out
      </BaseDropdownMenuItem>
    </div>
  </BaseDropdownMenu>
</template>
