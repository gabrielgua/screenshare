<script setup lang="ts">
import { computed } from 'vue'
import BaseBadge from '@/components/badge/BaseBadge.vue'
import type { UserRole } from '@/services/users-service'
import { displayDetailsByRole } from './user-display-details'

interface UserRoleBadgeProps {
  role: UserRole
}

const props = defineProps<UserRoleBadgeProps>()

const roleDetails = computed(() => displayDetailsByRole[props.role])
</script>

<template>
  <BaseBadge appearance="soft" :variant="roleDetails.variant" :icon="roleDetails.icon">
    {{ roleDetails.label }}
  </BaseBadge>
</template>
