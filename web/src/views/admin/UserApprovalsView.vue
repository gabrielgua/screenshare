<script setup lang="ts">
import AdminPageHeading from '@/components/admin/AdminPageHeading.vue'
import PendingUsersList from '@/components/user-approvals/PendingUsersList.vue'
</script>

<template>
  <section class="flex flex-col gap-6">
    <AdminPageHeading
      title="User approvals"
      description="People who signed in with Discord and are waiting for access. Approve or deny each one."
    />
    <PendingUsersList />
  </section>
</template>
