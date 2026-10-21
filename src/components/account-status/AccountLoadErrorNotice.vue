<script setup lang="ts">
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { WarningIcon } from '@/theme/app-icons'
import AccountStatusNotice from './AccountStatusNotice.vue'

const currentUserStore = useCurrentUserStore()
</script>

<template>
  <AccountStatusNotice title="We could not load your account">
    <template #illustration>
      <BaseIconCircle :icon="WarningIcon" variant="warning" size="lg" />
    </template>
    <BaseText size="lg" tone="muted">
      {{ currentUserStore.loadErrorMessage ?? 'Your account could not be found.' }} Try signing out
      and signing in again.
    </BaseText>
  </AccountStatusNotice>
</template>
