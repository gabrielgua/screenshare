<script setup lang="ts">
import { computed, onMounted } from 'vue'
import LoadErrorRetry from '@/components/feedback/LoadErrorRetry.vue'
import NoMatchingResults from '@/components/feedback/NoMatchingResults.vue'
import PageLoadingSpinner from '@/components/layout/PageLoadingSpinner.vue'
import PageTransition from '@/components/layout/PageTransition.vue'
import StaggeredListTransition from '@/components/layout/StaggeredListTransition.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { useRegisteredUsersStore } from '@/stores/registered-users-store'
import RegisteredUserCard from './RegisteredUserCard.vue'
import RegisteredUsersFilters from './RegisteredUsersFilters.vue'

const registeredUsersStore = useRegisteredUsersStore()
const currentUserStore = useCurrentUserStore()

const userCountSummary = computed(() => {
  const totalLabel = `${registeredUsersStore.registeredUserCount} ${
    registeredUsersStore.registeredUserCount === 1 ? 'user' : 'users'
  }`
  return registeredUsersStore.hasActiveFilters
    ? `Showing ${registeredUsersStore.filteredRegisteredUserCount} of ${totalLabel}`
    : totalLabel
})

onMounted(() => {
  registeredUsersStore.loadRegisteredUsers()
})

function handleRetryRequested() {
  registeredUsersStore.loadRegisteredUsers()
}

function handleClearFiltersRequested() {
  registeredUsersStore.clearFilters()
}
</script>

<template>
  <PageTransition>
    <PageLoadingSpinner
      v-if="
        registeredUsersStore.isLoadingRegisteredUsers && !registeredUsersStore.hasRegisteredUsers
      "
      accessible-label="Loading registered users"
    />
    <LoadErrorRetry
      v-else-if="registeredUsersStore.loadErrorMessage"
      :error-message="registeredUsersStore.loadErrorMessage"
      @retry-requested="handleRetryRequested"
    />
    <div v-else class="flex flex-col gap-4">
      <RegisteredUsersFilters />
      <BaseText size="sm" weight="medium" tone="subtle" aria-live="polite">
        {{ userCountSummary }}
      </BaseText>
      <PageTransition>
        <NoMatchingResults
          v-if="registeredUsersStore.filteredRegisteredUserCount === 0"
          title="No users match your filters"
          @clear-filters-requested="handleClearFiltersRequested"
        />
        <StaggeredListTransition v-else tag="ul" class="flex flex-col gap-3">
          <li
            v-for="(registeredUser, listPosition) in registeredUsersStore.filteredRegisteredUsers"
            :key="registeredUser.id"
            :data-stagger-index="listPosition"
          >
            <RegisteredUserCard
              :registered-user="registeredUser"
              :is-current-user="registeredUser.id === currentUserStore.currentUser?.id"
            />
          </li>
        </StaggeredListTransition>
      </PageTransition>
    </div>
  </PageTransition>
</template>
