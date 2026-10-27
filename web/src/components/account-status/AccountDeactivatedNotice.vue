<script setup lang="ts">
import AccountDeactivatedIllustration from '@/components/illustration/AccountDeactivatedIllustration.vue'
import BaseText from '@/components/typography/BaseText.vue'
import AccountStatusNotice from './AccountStatusNotice.vue'
</script>

<template>
  <AccountStatusNotice title="Your account is deactivated">
    <template #illustration>
      <AccountDeactivatedIllustration />
    </template>
    <BaseText size="lg" tone="muted">
      An admin paused your access to the platform. Nothing was deleted, so everything will be right
      where you left it if your account is activated again.
    </BaseText>
  </AccountStatusNotice>
</template>
