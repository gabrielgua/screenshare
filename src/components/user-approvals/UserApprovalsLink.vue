<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseBadge from '@/components/badge/BaseBadge.vue'
import BaseButton from '@/components/button/BaseButton.vue'
import { usePendingUsersStore } from '@/stores/pending-users-store'
import { UserApprovalsIcon } from '@/theme/app-icons'

const router = useRouter()
const pendingUsersStore = usePendingUsersStore()

onMounted(() => {
  pendingUsersStore.loadPendingUsers()
})

function handleApprovalsButtonClick() {
  router.push({ name: 'user-approvals' })
}
</script>

<template>
  <BaseButton
    variant="neutral"
    appearance="ghost"
    :leading-icon="UserApprovalsIcon"
    aria-label="User approvals"
    @click="handleApprovalsButtonClick"
  >
    <span class="hidden sm:inline">Approvals</span>
    <BaseBadge v-if="pendingUsersStore.hasPendingUsers" variant="danger">
      {{ pendingUsersStore.pendingUserCount }}
    </BaseBadge>
  </BaseButton>
</template>
