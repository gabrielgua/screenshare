<script setup lang="ts">
import { computed, ref } from 'vue'
import ConfirmActionModal from '@/components/feedback/ConfirmActionModal.vue'
import StaggeredListTransition from '@/components/layout/StaggeredListTransition.vue'
import { describeError } from '@/services/describe-error'
import type { RoomMember } from '@/services/rooms-service'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { useRoomStore } from '@/stores/room-store'
import { RoomBlockedUserIcon } from '@/theme/app-icons'
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

const isBlockModalOpen = ref(false)
const memberBeingBlocked = ref<RoomMember>()
const isBlockingMember = ref(false)

const memberBeingBlockedName = computed(
  () => memberBeingBlocked.value?.displayName ?? 'this member',
)

function isCurrentUser(roomMember: RoomMember): boolean {
  return roomMember.userId === currentUserStore.currentUser?.id
}

function canManage(roomMember: RoomMember): boolean {
  return roomStore.canManageRoom && !roomMember.isOwner && !isCurrentUser(roomMember)
}

function openBlockModal(roomMember: RoomMember) {
  memberBeingBlocked.value = roomMember
  isBlockModalOpen.value = true
}

async function handleBlockConfirmed() {
  const blockedMember = memberBeingBlocked.value
  if (!blockedMember) {
    return
  }
  isBlockingMember.value = true
  try {
    await roomStore.removeMemberFromRequestedRoom(blockedMember.userId)
    isBlockModalOpen.value = false
    actionFeedbackStore.showSuccessFeedback(
      `${blockedMember.displayName} was blocked`,
      'They were sent out of the room and cannot join again until someone unblocks them.',
    )
  } catch (blockError) {
    actionFeedbackStore.showErrorFeedback(
      'Could not block this member',
      describeError(blockError, 'Something went wrong. Please try again.'),
    )
  } finally {
    isBlockingMember.value = false
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
          :can-be-managed="canManage(roomMember)"
          :is-present="props.presentUserIds.includes(roomMember.userId)"
          @block-requested="openBlockModal(roomMember)"
        />
      </li>
    </StaggeredListTransition>

    <ConfirmActionModal
      v-model:open="isBlockModalOpen"
      :title="`Block ${memberBeingBlockedName}?`"
      description="They are sent out of the room right away, lose their membership and cannot join again, even with the link, until they are unblocked."
      confirm-label="Block"
      :icon="RoomBlockedUserIcon"
      variant="danger"
      :is-submitting="isBlockingMember"
      @confirmed="handleBlockConfirmed"
    />
  </section>
</template>
