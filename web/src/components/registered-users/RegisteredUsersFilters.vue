<script setup lang="ts">
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseChipGroup, { type BaseChipOption } from '@/components/chip/BaseChipGroup.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import type { UserApprovalStatus, UserRole } from '@/services/users-service'
import { useRegisteredUsersStore } from '@/stores/registered-users-store'
import { CloseIcon, SearchIcon } from '@/theme/app-icons'
import {
  FILTERABLE_APPROVAL_STATUSES,
  FILTERABLE_ROLES,
  displayDetailsByApprovalStatus,
  displayDetailsByRole,
} from './user-display-details'

const registeredUsersStore = useRegisteredUsersStore()
const { searchTerm, selectedRoles, selectedApprovalStatuses, hasActiveFilters } =
  storeToRefs(registeredUsersStore)

const roleOptions: BaseChipOption<UserRole>[] = FILTERABLE_ROLES.map((role) => ({
  value: role,
  label: displayDetailsByRole[role].label,
  icon: displayDetailsByRole[role].icon,
}))

const approvalStatusOptions: BaseChipOption<UserApprovalStatus>[] =
  FILTERABLE_APPROVAL_STATUSES.map((approvalStatus) => ({
    value: approvalStatus,
    label: displayDetailsByApprovalStatus[approvalStatus].label,
    icon: displayDetailsByApprovalStatus[approvalStatus].icon,
  }))

function handleClearFiltersButtonClick() {
  registeredUsersStore.clearFilters()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <BaseInput
      v-model="searchTerm"
      type="search"
      :leading-icon="SearchIcon"
      placeholder="Search by name or email"
      autocomplete="off"
      aria-label="Search users"
    />
    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
      <BaseChipGroup v-model="selectedRoles" group-label="Role" :options="roleOptions" />
      <BaseChipGroup
        v-model="selectedApprovalStatuses"
        group-label="Status"
        :options="approvalStatusOptions"
      />
      <BaseButton
        v-if="hasActiveFilters"
        size="sm"
        variant="neutral"
        appearance="ghost"
        :leading-icon="CloseIcon"
        class="self-start sm:ml-auto sm:self-auto"
        @click="handleClearFiltersButtonClick"
      >
        Clear filters
      </BaseButton>
    </div>
  </div>
</template>
