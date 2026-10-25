<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminBackLink from '@/components/admin/AdminBackLink.vue'
import LoadErrorRetry from '@/components/feedback/LoadErrorRetry.vue'
import PageLoadingSpinner from '@/components/layout/PageLoadingSpinner.vue'
import PageTransition from '@/components/layout/PageTransition.vue'
import RoomDetailsHeader from '@/components/room-details/RoomDetailsHeader.vue'
import RoomDetailsInformation from '@/components/room-details/RoomDetailsInformation.vue'
import RoomManagementActions from '@/components/room-details/RoomManagementActions.vue'
import RoomBlockedUsersSection from '@/components/rooms/RoomBlockedUsersSection.vue'
import RoomMembersSection from '@/components/rooms/RoomMembersSection.vue'
import { useRoomStore } from '@/stores/room-store'

const route = useRoute()
const roomStore = useRoomStore()

const requestedRoomId = computed(() => String(route.params.roomId))
const roomOwnerName = computed(() => roomStore.roomPreview?.ownerName ?? 'Unknown owner')

watch(requestedRoomId, (roomId) => roomStore.loadRoom(roomId), { immediate: true })

function handleRetryRequested() {
  roomStore.loadRoom(requestedRoomId.value)
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <AdminBackLink :destination="{ name: 'admin-rooms' }" label="All rooms" />
    <PageTransition>
      <PageLoadingSpinner
        v-if="roomStore.visibleRoomScreen === 'loading'"
        accessible-label="Loading room"
      />
      <LoadErrorRetry
        v-else-if="roomStore.visibleRoomScreen !== 'room' || !roomStore.room"
        :error-message="roomStore.loadErrorMessage ?? 'This room does not exist.'"
        @retry-requested="handleRetryRequested"
      />
      <div v-else class="flex flex-col gap-4">
        <RoomDetailsHeader
          :room-id="roomStore.room.id"
          :room-name="roomStore.room.name"
          :owner-name="roomOwnerName"
          :owner-avatar-url="roomStore.roomPreview?.ownerAvatarUrl"
        />
        <RoomManagementActions :room-name="roomStore.room.name" />
        <RoomDetailsInformation
          :room="roomStore.room"
          :owner-name="roomOwnerName"
          :member-count="roomStore.roomMembers.length"
          :blocked-user-count="roomStore.roomBlockedUsers.length"
        />
        <RoomMembersSection />
        <RoomBlockedUsersSection />
      </div>
    </PageTransition>
  </section>
</template>
