<script setup lang="ts">
import SignedInUserAvatar from '@/components/authentication/SignedInUserAvatar.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'

const authenticationStore = useAuthenticationStore()
</script>

<template>
  <section class="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
    <SignedInUserAvatar size="lg" />
    <BaseHeading :level="1" size="title">
      Welcome, {{ authenticationStore.displayName }}
    </BaseHeading>
    <BaseText size="lg" tone="muted">
      You are signed in with Discord. Rooms and screen sharing are coming next.
    </BaseText>
  </section>
</template>
