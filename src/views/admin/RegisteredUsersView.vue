<script setup lang="ts">
import AdminPageHeading from '@/components/admin/AdminPageHeading.vue'
import RegisteredUsersList from '@/components/registered-users/RegisteredUsersList.vue'
</script>

<template>
  <section class="flex flex-col gap-6">
    <AdminPageHeading
      title="Registered users"
      description="Everyone who has signed in with Discord, newest first."
    />
    <RegisteredUsersList />
  </section>
</template>
