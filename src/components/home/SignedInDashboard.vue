<script setup lang="ts">
import ReviewMessageCard from '@/components/account-status/ReviewMessageCard.vue'
import SignedInUserAvatar from '@/components/authentication/SignedInUserAvatar.vue'
import MyRoomsSection from '@/components/rooms/MyRoomsSection.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCurrentUserStore } from '@/stores/current-user-store'

const authenticationStore = useAuthenticationStore()
const currentUserStore = useCurrentUserStore()
</script>

<template>
  <div class="flex w-full flex-col gap-8">
    <section class="flex items-center gap-4">
      <SignedInUserAvatar size="lg" />
      <div class="flex min-w-0 flex-col gap-1">
        <BaseHeading :level="1" size="title" class="truncate">
          Welcome, {{ authenticationStore.displayName }}
        </BaseHeading>
        <BaseText tone="muted">Pick a room or create one to start sharing.</BaseText>
      </div>
    </section>
    <ReviewMessageCard
      v-if="currentUserStore.currentUser?.reviewMessage"
      label="Message from the admin"
      :message="currentUserStore.currentUser.reviewMessage"
    />
    <MyRoomsSection />
  </div>
</template>
