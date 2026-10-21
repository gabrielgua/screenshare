<script setup lang="ts">
import ReviewMessageCard from '@/components/account-status/ReviewMessageCard.vue'
import SignedInUserAvatar from '@/components/authentication/SignedInUserAvatar.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCurrentUserStore } from '@/stores/current-user-store'

const authenticationStore = useAuthenticationStore()
const currentUserStore = useCurrentUserStore()
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
    <ReviewMessageCard
      v-if="currentUserStore.currentUser?.reviewMessage"
      label="Message from the admin"
      :message="currentUserStore.currentUser.reviewMessage"
    />
  </section>
</template>
