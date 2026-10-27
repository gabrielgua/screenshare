<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import PendingReviewIllustration from '@/components/illustration/PendingReviewIllustration.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { EmailNotificationIcon } from '@/theme/app-icons'
import AccountStatusNotice from './AccountStatusNotice.vue'

const authenticationStore = useAuthenticationStore()
</script>

<template>
  <AccountStatusNotice title="Your account is pending review">
    <template #illustration>
      <PendingReviewIllustration />
    </template>
    <BaseText size="lg" tone="muted">
      Thanks for signing up, {{ authenticationStore.displayName }}! An admin is taking a look at
      your account so you can start sharing your screen with friends.
    </BaseText>
    <div
      class="flex w-full items-center gap-3 rounded-card border border-brand-200 bg-brand-50 px-4 py-3 text-left text-brand-700 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-300"
    >
      <BaseIcon :icon="EmailNotificationIcon" size="lg" />
      <BaseText size="sm" weight="medium" tone="brand">
        You will receive an email when your account is ready.
      </BaseText>
    </div>
  </AccountStatusNotice>
</template>
