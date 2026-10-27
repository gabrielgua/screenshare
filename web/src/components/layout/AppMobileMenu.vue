<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import SignedInUserProfileSummary from '@/components/authentication/SignedInUserProfileSummary.vue'
import BaseBadge from '@/components/badge/BaseBadge.vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseDrawer from '@/components/dialog/BaseDrawer.vue'
import { useColorScheme } from '@/composables/use-color-scheme'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { usePendingUsersStore } from '@/stores/pending-users-store'
import { AdminPanelIcon, HomeIcon, MenuIcon, RoomIcon, SignOutIcon } from '@/theme/app-icons'

const router = useRouter()
const authenticationStore = useAuthenticationStore()
const currentUserStore = useCurrentUserStore()
const pendingUsersStore = usePendingUsersStore()
const { switchColorSchemeIcon, switchColorSchemeLabel, toggleColorScheme } = useColorScheme()

const isMenuOpen = ref(false)

function handleMenuButtonClick() {
  isMenuOpen.value = true
}

function navigateFromMenu(destination: RouteLocationRaw) {
  isMenuOpen.value = false
  router.push(destination)
}

function handleColorSchemeButtonClick() {
  toggleColorScheme()
}

function handleSignOutButtonClick() {
  isMenuOpen.value = false
  authenticationStore.signOut()
}
</script>

<template>
  <BaseIconButton
    :icon="MenuIcon"
    accessible-label="Open the menu"
    variant="neutral"
    appearance="ghost"
    @click="handleMenuButtonClick"
  />
  <BaseDrawer v-model:open="isMenuOpen" title="Menu">
    <div class="flex flex-col gap-4">
      <div class="rounded-card bg-neutral-100 p-4 dark:bg-neutral-800">
        <SignedInUserProfileSummary />
      </div>
      <nav aria-label="Main" class="flex flex-col gap-1">
        <BaseButton
          variant="neutral"
          appearance="ghost"
          size="lg"
          content-alignment="start"
          :leading-icon="HomeIcon"
          is-full-width
          @click="navigateFromMenu({ name: 'home' })"
        >
          Home
        </BaseButton>
        <BaseButton
          v-if="currentUserStore.isApproved"
          variant="neutral"
          appearance="ghost"
          size="lg"
          content-alignment="start"
          :leading-icon="RoomIcon"
          is-full-width
          @click="navigateFromMenu({ name: 'rooms' })"
        >
          Rooms
        </BaseButton>
        <BaseButton
          v-if="currentUserStore.isAdmin"
          variant="neutral"
          appearance="ghost"
          size="lg"
          content-alignment="start"
          :leading-icon="AdminPanelIcon"
          is-full-width
          @click="navigateFromMenu({ name: 'admin-approvals' })"
        >
          <span class="flex-1">Admin</span>
          <BaseBadge v-if="pendingUsersStore.hasPendingUsers" variant="danger">
            {{ pendingUsersStore.pendingUserCount }}
          </BaseBadge>
        </BaseButton>
        <BaseButton
          variant="neutral"
          appearance="ghost"
          size="lg"
          content-alignment="start"
          :leading-icon="switchColorSchemeIcon"
          is-full-width
          @click="handleColorSchemeButtonClick"
        >
          {{ switchColorSchemeLabel }}
        </BaseButton>
      </nav>
      <BaseButton
        variant="danger"
        appearance="outlined"
        size="lg"
        :leading-icon="SignOutIcon"
        is-full-width
        @click="handleSignOutButtonClick"
      >
        Sign out
      </BaseButton>
    </div>
  </BaseDrawer>
</template>
