<script setup lang="ts">
import BaseBadge from '@/components/badge/BaseBadge.vue'
import type { PlatformUser } from '@/services/users-service'
import { InactiveIcon } from '@/theme/app-icons'
import UserApprovalStatusBadge from './UserApprovalStatusBadge.vue'
import UserRoleBadge from './UserRoleBadge.vue'

interface UserStatusBadgesProps {
  user: PlatformUser
}

defineProps<UserStatusBadgesProps>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5">
    <UserRoleBadge :role="user.role" />
    <UserApprovalStatusBadge :approval-status="user.approvalStatus" />
    <BaseBadge v-if="!user.isActive" appearance="soft" variant="neutral" :icon="InactiveIcon">
      Inactive
    </BaseBadge>
  </div>
</template>
