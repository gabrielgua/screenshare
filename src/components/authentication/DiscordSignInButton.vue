<script setup lang="ts">
import BaseButton from '@/components/button/BaseButton.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { DiscordIcon } from '@/theme/app-icons'

const authenticationStore = useAuthenticationStore()

function handleSignInButtonClick() {
  authenticationStore.signInWithDiscord()
}
</script>

<template>
  <div class="flex w-full flex-col items-center gap-2 sm:w-auto">
    <BaseButton
      size="lg"
      :leading-icon="DiscordIcon"
      :is-loading="authenticationStore.isRedirectingToDiscord"
      class="w-full sm:w-auto"
      @click="handleSignInButtonClick"
    >
      Sign in with Discord
    </BaseButton>
    <BaseText v-if="authenticationStore.signInErrorMessage" size="sm" tone="danger" role="alert">
      {{ authenticationStore.signInErrorMessage }}
    </BaseText>
  </div>
</template>
