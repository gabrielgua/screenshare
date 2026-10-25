<script setup lang="ts">
import { computed, ref } from 'vue'
import ConfirmActionModal from '@/components/feedback/ConfirmActionModal.vue'
import StaggeredListTransition from '@/components/layout/StaggeredListTransition.vue'
import { describeError } from '@/services/describe-error'
import type { RoomMember } from '@/services/rooms-service'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { useRoomStore } from '@/stores/room-store'
import { RemoveRoomMemberIcon } from '@/theme/app-icons'
import RoomMemberCard from './RoomMemberCard.vue'
import RoomSectionHeading from './RoomSectionHeading.vue'

interface RoomMembersSectionProps {
  presentUserIds?: string[]
}

const props = withDefaults(defineProps<RoomMembersSectionProps>(), {
  presentUserIds: () => [],
})

const roomStore = useRoomStore()
const currentUserStore = useCurrentUserStore()
const actionFeedbackStore = useActionFeedbackStore()

const isRemoveModalOpen = ref(false)
const memberBeingRemoved = ref<RoomMember>()
const isRemovingMember = ref(false)

const memberBeingRemovedName = computed(
  () => memberBeingRemoved.value?.displayName ?? 'this member',
)

function isCurrentUser(roomMember: RoomMember): boolean {
  return roomMember.userId === currentUserStore.currentUser?.id
}

function canRemove(roomMember: RoomMember): boolean {
  return roomStore.canManageRoom && !roomMember.isOwner && !isCurrentUser(roomMember)
}

function openRemoveModal(roomMember: RoomMember) {
  memberBeingRemoved.value = roomMember
  isRemoveModalOpen.value = true
}

async function handleRemoveConfirmed() {
  const removedMember = memberBeingRemoved.value
  if (!removedMember) {
    return
  }
  isRemovingMember.value = true
  try {
    await roomStore.removeMemberFromRequestedRoom(removedMember.userId)
    isRemoveModalOpen.value = false
    actionFeedbackStore.showSuccessFeedback(
      `${removedMember.displayName} was removed`,
      'They are blocked from this room until someone unblocks them.',
    )
  } catch (removeError) {
    actionFeedbackStore.showErrorFeedback(
      'Could not remove this member',
      describeError(removeError, 'Something went wrong. Please try again.'),
    )
  } finally {
    isRemovingMember.value = false
  }
}
</script>

<template>
  <section class="@container flex flex-col gap-3">
    <RoomSectionHeading title="Members" :count="roomStore.roomMembers.length" />
    <StaggeredListTransition tag="ul" class="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-3">
      <li
        v-for="(roomMember, listPosition) in roomStore.roomMembers"
        :key="roomMember.userId"
        :data-stagger-index="listPosition"
        class="min-w-0"
      >
        <RoomMemberCard
          :room-member="roomMember"
          :is-current-user="isCurrentUser(roomMember)"
          :can-be-removed="canRemove(roomMember)"
          :is-present="props.presentUserIds.includes(roomMember.userId)"
          @removal-requested="openRemoveModal(roomMember)"
        />
      </li>
    </StaggeredListTransition>

    <ConfirmActionModal
      v-model:open="isRemoveModalOpen"
      :title="`Remove ${memberBeingRemovedName}?`"
      description="They leave this room right away and cannot join again, even with the link, until they are unblocked."
      confirm-label="Remove"
      :icon="RemoveRoomMemberIcon"
      variant="danger"
      :is-submitting="isRemovingMember"
      @confirmed="handleRemoveConfirmed"
    />
  </section>
</template>
