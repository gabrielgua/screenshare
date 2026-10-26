<script setup lang="ts">
import { computed, ref } from 'vue'
import ConfirmActionModal from '@/components/feedback/ConfirmActionModal.vue'
import StaggeredListTransition from '@/components/layout/StaggeredListTransition.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { describeError } from '@/services/describe-error'
import type { RoomBlockedUser } from '@/services/rooms-service'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { useRoomStore } from '@/stores/room-store'
import { UnblockRoomUserIcon } from '@/theme/app-icons'
import RoomBlockedUserCard from './RoomBlockedUserCard.vue'
import RoomSectionHeading from './RoomSectionHeading.vue'

const roomStore = useRoomStore()
const actionFeedbackStore = useActionFeedbackStore()

const isUnblockModalOpen = ref(false)
const userBeingUnblocked = ref<RoomBlockedUser>()
const isUnblockingUser = ref(false)

const userBeingUnblockedName = computed(() => userBeingUnblocked.value?.displayName ?? 'this user')

function openUnblockModal(roomBlockedUser: RoomBlockedUser) {
  userBeingUnblocked.value = roomBlockedUser
  isUnblockModalOpen.value = true
}

async function handleUnblockConfirmed() {
  const unblockedUser = userBeingUnblocked.value
  if (!unblockedUser) {
    return
  }
  isUnblockingUser.value = true
  try {
    await roomStore.unblockUserFromRequestedRoom(unblockedUser.userId)
    isUnblockModalOpen.value = false
    actionFeedbackStore.showSuccessFeedback(
      `${unblockedUser.displayName} was unblocked`,
      'They can join again with the room link.',
    )
  } catch (unblockError) {
    actionFeedbackStore.showErrorFeedback(
      'Could not unblock this user',
      describeError(unblockError, 'Something went wrong. Please try again.'),
    )
  } finally {
    isUnblockingUser.value = false
  }
}
</script>

<template>
  <section class="@container flex flex-col gap-3">
    <RoomSectionHeading
      title="Blocked"
      :count="roomStore.roomBlockedUsers.length"
      description="Removed members can't join again until they are unblocked."
    />
    <BaseText
      v-if="roomStore.roomBlockedUsers.length === 0"
      size="sm"
      tone="subtle"
      class="rounded-card border border-dashed border-neutral-200 px-4 py-6 text-center dark:border-neutral-800"
    >
      Nobody is blocked from this room.
    </BaseText>
    <StaggeredListTransition v-else tag="ul" class="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-3">
      <li
        v-for="(roomBlockedUser, listPosition) in roomStore.roomBlockedUsers"
        :key="roomBlockedUser.userId"
        :data-stagger-index="listPosition"
        class="min-w-0"
      >
        <RoomBlockedUserCard
          :room-blocked-user="roomBlockedUser"
          @unblock-requested="openUnblockModal(roomBlockedUser)"
        />
      </li>
    </StaggeredListTransition>

    <ConfirmActionModal
      v-model:open="isUnblockModalOpen"
      :title="`Unblock ${userBeingUnblockedName}?`"
      description="They will not be added back, but they can join again with the room link."
      confirm-label="Unblock"
      :icon="UnblockRoomUserIcon"
      variant="primary"
      :is-submitting="isUnblockingUser"
      @confirmed="handleUnblockConfirmed"
    />
  </section>
</template>
