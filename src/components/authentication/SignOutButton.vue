<script lang="ts" setup>
import { useAuthenticationStore } from '@/stores/authentication-store'
import BaseIconButton from '../button/BaseIconButton.vue'
import { SignOutIcon } from '@/theme/app-icons'

const authenticationStore = useAuthenticationStore()

function handleSignOutButtonClick() {
  authenticationStore.signOut()
}
</script>
<template>
  <BaseIconButton
    :icon="SignOutIcon"
    accessible-label="Sign out"
    variant="neutral"
    appearance="ghost"
    @click="handleSignOutButtonClick"
  />
</template>
