<script setup lang="ts">
import AdminPageHeading from '@/components/admin/AdminPageHeading.vue'
import AdministeredRoomsList from '@/components/administered-rooms/AdministeredRoomsList.vue'
</script>

<template>
  <section class="flex flex-col gap-6">
    <AdminPageHeading title="Rooms" description="Every room on the platform, newest first." />
    <AdministeredRoomsList />
  </section>
</template>
