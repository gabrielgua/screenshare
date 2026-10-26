<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseBadge from '@/components/badge/BaseBadge.vue'
import BaseButton from '@/components/button/BaseButton.vue'
import { usePendingUsersStore } from '@/stores/pending-users-store'
import { AdminPanelIcon } from '@/theme/app-icons'

const router = useRouter()
const pendingUsersStore = usePendingUsersStore()

onMounted(() => {
  pendingUsersStore.loadPendingUsers()
})

function handleAdminPanelButtonClick() {
  router.push({ name: 'admin-approvals' })
}
</script>

<template>
  <BaseButton
    variant="neutral"
    appearance="ghost"
    :leading-icon="AdminPanelIcon"
    aria-label="Admin panel"
    @click="handleAdminPanelButtonClick"
  >
    <span class="hidden sm:inline">Admin</span>
    <BaseBadge v-if="pendingUsersStore.hasPendingUsers" variant="danger">
      {{ pendingUsersStore.pendingUserCount }}
    </BaseBadge>
  </BaseButton>
</template>
