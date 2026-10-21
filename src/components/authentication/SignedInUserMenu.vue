<script setup lang="ts">
import SignedInUserAvatar from './SignedInUserAvatar.vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { SignOutIcon } from '@/theme/app-icons'

const authenticationStore = useAuthenticationStore()

function handleSignOutButtonClick() {
  authenticationStore.signOut()
}
</script>

<template>
  <div class="flex items-center gap-2">
    <SignedInUserAvatar size="sm" />
    <BaseText as="span" size="sm" weight="semibold" class="hidden max-w-40 truncate sm:inline">
      {{ authenticationStore.displayName }}
    </BaseText>
    <BaseIconButton
      :icon="SignOutIcon"
      accessible-label="Sign out"
      variant="neutral"
      appearance="ghost"
      @click="handleSignOutButtonClick"
    />
  </div>
</template>
