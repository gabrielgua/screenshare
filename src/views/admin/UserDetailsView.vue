<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminBackLink from '@/components/admin/AdminBackLink.vue'
import LoadErrorRetry from '@/components/feedback/LoadErrorRetry.vue'
import PageLoadingSpinner from '@/components/layout/PageLoadingSpinner.vue'
import PageTransition from '@/components/layout/PageTransition.vue'
import UserDetailsHeader from '@/components/user-details/UserDetailsHeader.vue'
import UserDetailsInformation from '@/components/user-details/UserDetailsInformation.vue'
import UserManagementActions from '@/components/user-details/UserManagementActions.vue'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { useUserDetailsStore } from '@/stores/user-details-store'

const route = useRoute()
const userDetailsStore = useUserDetailsStore()
const currentUserStore = useCurrentUserStore()

const requestedUserId = computed(() => String(route.params.userId))
const isViewingOwnAccount = computed(
  () => requestedUserId.value === currentUserStore.currentUser?.id,
)

watch(requestedUserId, (userId) => userDetailsStore.loadViewedUser(userId), { immediate: true })

function handleRetryRequested() {
  userDetailsStore.loadViewedUser(requestedUserId.value)
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <AdminBackLink :destination="{ name: 'admin-users' }" label="All users" />
    <PageTransition>
      <PageLoadingSpinner
        v-if="userDetailsStore.isLoadingViewedUser && !userDetailsStore.viewedUser"
        accessible-label="Loading user"
      />
      <LoadErrorRetry
        v-else-if="userDetailsStore.loadErrorMessage || !userDetailsStore.viewedUser"
        :error-message="userDetailsStore.loadErrorMessage ?? 'Could not load this user'"
        @retry-requested="handleRetryRequested"
      />
      <div v-else class="flex flex-col gap-4">
        <UserDetailsHeader
          :viewed-user="userDetailsStore.viewedUser"
          :is-current-user="isViewingOwnAccount"
        />
        <UserManagementActions
          :viewed-user="userDetailsStore.viewedUser"
          :is-current-user="isViewingOwnAccount"
        />
        <UserDetailsInformation :viewed-user="userDetailsStore.viewedUser" />
      </div>
    </PageTransition>
  </section>
</template>
