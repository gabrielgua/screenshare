<script setup lang="ts">
import AccessDeniedIllustration from '@/components/illustration/AccessDeniedIllustration.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useCurrentUserStore } from '@/stores/current-user-store'
import AccountStatusNotice from './AccountStatusNotice.vue'
import ReviewMessageCard from './ReviewMessageCard.vue'

const currentUserStore = useCurrentUserStore()
</script>

<template>
  <AccountStatusNotice title="Your access request was not approved">
    <template #illustration>
      <AccessDeniedIllustration />
    </template>
    <BaseText size="lg" tone="muted">
      An admin reviewed your account and decided not to grant access for now.
    </BaseText>
    <ReviewMessageCard
      v-if="currentUserStore.currentUser?.reviewMessage"
      label="Reason"
      :message="currentUserStore.currentUser.reviewMessage"
    />
  </AccountStatusNotice>
</template>
