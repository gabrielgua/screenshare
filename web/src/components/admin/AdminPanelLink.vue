<script setup lang="ts">
import { onMounted } from 'vue'
import BaseBadge from '@/components/badge/BaseBadge.vue'
import HeaderNavigationLink from '@/components/layout/HeaderNavigationLink.vue'
import { usePendingUsersStore } from '@/stores/pending-users-store'
import { AdminPanelIcon } from '@/theme/app-icons'

const pendingUsersStore = usePendingUsersStore()

onMounted(() => {
  pendingUsersStore.loadPendingUsers()
})
</script>

<template>
  <HeaderNavigationLink
    :icon="AdminPanelIcon"
    label="Admin"
    :destination="{ name: 'admin-approvals' }"
  >
    <BaseBadge v-if="pendingUsersStore.hasPendingUsers" variant="danger">
      {{ pendingUsersStore.pendingUserCount }}
    </BaseBadge>
  </HeaderNavigationLink>
</template>
