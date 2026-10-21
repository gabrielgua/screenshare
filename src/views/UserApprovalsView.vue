<script setup lang="ts">
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import PendingUsersList from '@/components/user-approvals/PendingUsersList.vue'
</script>

<template>
  <AppHeader />
  <PageContainer>
    <div class="flex flex-col gap-2">
      <BaseHeading :level="1" size="title">User approvals</BaseHeading>
      <BaseText tone="muted">
        People who signed in with Discord and are waiting for access. Approve or deny each one.
      </BaseText>
    </div>
    <PendingUsersList />
  </PageContainer>
</template>
