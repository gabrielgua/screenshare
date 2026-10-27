<script setup lang="ts">
import { usePendingUsersStore } from '@/stores/pending-users-store'
import { RegisteredUsersIcon, RoomIcon, UserApprovalsIcon } from '@/theme/app-icons'
import AdminNavigationTab from './AdminNavigationTab.vue'

const pendingUsersStore = usePendingUsersStore()
</script>

<template>
  <nav
    aria-label="Admin sections"
    class="flex w-full gap-1 rounded-card bg-neutral-100 p-1 sm:w-fit dark:bg-neutral-900"
  >
    <AdminNavigationTab
      :destination="{ name: 'admin-approvals' }"
      label="Approvals"
      :icon="UserApprovalsIcon"
      :badge-count="pendingUsersStore.pendingUserCount"
    />
    <AdminNavigationTab
      :destination="{ name: 'admin-users' }"
      label="Users"
      :icon="RegisteredUsersIcon"
    />
    <AdminNavigationTab :destination="{ name: 'admin-rooms' }" label="Rooms" :icon="RoomIcon" />
  </nav>
</template>
