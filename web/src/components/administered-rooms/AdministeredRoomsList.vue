<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import LoadErrorRetry from '@/components/feedback/LoadErrorRetry.vue'
import NoMatchingResults from '@/components/feedback/NoMatchingResults.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import PageLoadingSpinner from '@/components/layout/PageLoadingSpinner.vue'
import PageTransition from '@/components/layout/PageTransition.vue'
import StaggeredListTransition from '@/components/layout/StaggeredListTransition.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useAdministeredRoomsStore } from '@/stores/administered-rooms-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { SearchIcon } from '@/theme/app-icons'
import AdministeredRoomCard from './AdministeredRoomCard.vue'
import AdministeredRoomsEmptyState from './AdministeredRoomsEmptyState.vue'

const administeredRoomsStore = useAdministeredRoomsStore()
const currentUserStore = useCurrentUserStore()
const { searchTerm } = storeToRefs(administeredRoomsStore)

const roomCountSummary = computed(() => {
  const totalLabel = `${administeredRoomsStore.administeredRoomCount} ${
    administeredRoomsStore.administeredRoomCount === 1 ? 'room' : 'rooms'
  }`
  return administeredRoomsStore.hasActiveFilters
    ? `Showing ${administeredRoomsStore.filteredAdministeredRoomCount} of ${totalLabel}`
    : totalLabel
})

onMounted(() => {
  administeredRoomsStore.loadAdministeredRooms()
})

function handleRetryRequested() {
  administeredRoomsStore.loadAdministeredRooms()
}

function handleClearFiltersRequested() {
  administeredRoomsStore.clearFilters()
}
</script>

<template>
  <PageTransition>
    <PageLoadingSpinner
      v-if="
        administeredRoomsStore.isLoadingAdministeredRooms &&
        !administeredRoomsStore.hasAdministeredRooms
      "
      accessible-label="Loading rooms"
    />
    <LoadErrorRetry
      v-else-if="administeredRoomsStore.loadErrorMessage"
      :error-message="administeredRoomsStore.loadErrorMessage"
      @retry-requested="handleRetryRequested"
    />
    <AdministeredRoomsEmptyState v-else-if="!administeredRoomsStore.hasAdministeredRooms" />
    <div v-else class="flex flex-col gap-4">
      <BaseInput
        v-model="searchTerm"
        type="search"
        :leading-icon="SearchIcon"
        placeholder="Search by room or owner name"
        autocomplete="off"
        aria-label="Search rooms"
      />
      <BaseText size="sm" weight="medium" tone="subtle" aria-live="polite">
        {{ roomCountSummary }}
      </BaseText>
      <PageTransition>
        <NoMatchingResults
          v-if="administeredRoomsStore.filteredAdministeredRoomCount === 0"
          title="No rooms match your search"
          @clear-filters-requested="handleClearFiltersRequested"
        />
        <StaggeredListTransition v-else tag="ul" class="flex flex-col gap-3">
          <li
            v-for="(
              administeredRoom, listPosition
            ) in administeredRoomsStore.filteredAdministeredRooms"
            :key="administeredRoom.id"
            :data-stagger-index="listPosition"
          >
            <AdministeredRoomCard
              :administered-room="administeredRoom"
              :is-owned-by-current-user="
                administeredRoom.ownerId === currentUserStore.currentUser?.id
              "
            />
          </li>
        </StaggeredListTransition>
      </PageTransition>
    </div>
  </PageTransition>
</template>
