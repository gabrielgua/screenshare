<script setup lang="ts">
import { computed } from 'vue'
import BaseBadge from '@/components/badge/BaseBadge.vue'
import type { UserApprovalStatus } from '@/services/users-service'
import { displayDetailsByApprovalStatus } from './user-display-details'

interface UserApprovalStatusBadgeProps {
  approvalStatus: UserApprovalStatus
}

const props = defineProps<UserApprovalStatusBadgeProps>()

const statusDetails = computed(() => displayDetailsByApprovalStatus[props.approvalStatus])
</script>

<template>
  <BaseBadge appearance="soft" :variant="statusDetails.variant" :icon="statusDetails.icon">
    {{ statusDetails.label }}
  </BaseBadge>
</template>
