<script setup lang="ts">
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { DenyIcon } from '@/theme/app-icons'
import AccountStatusNotice from './AccountStatusNotice.vue'

const currentUserStore = useCurrentUserStore()
</script>

<template>
  <AccountStatusNotice title="Your access request was not approved">
    <template #illustration>
      <BaseIconCircle :icon="DenyIcon" variant="danger" size="lg" />
    </template>
    <BaseText size="lg" tone="muted">
      An admin reviewed your account and decided not to grant access for now.
    </BaseText>
    <BaseCard
      v-if="currentUserStore.currentUser?.reviewReason"
      padding="compact"
      class="w-full text-left"
    >
      <BaseText size="caption" weight="semibold" tone="subtle" class="uppercase tracking-wide">
        Reason
      </BaseText>
      <BaseText class="pt-1">{{ currentUserStore.currentUser.reviewReason }}</BaseText>
    </BaseCard>
  </AccountStatusNotice>
</template>
