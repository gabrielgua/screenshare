<script setup lang="ts">
import { ref } from 'vue'
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { formatMemberCount } from '@/formatting/member-count'
import { describeError } from '@/services/describe-error'
import type { RoomPreview } from '@/services/rooms-service'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { useRoomStore } from '@/stores/room-store'
import { ArrowRightIcon } from '@/theme/app-icons'

interface RoomInvitationProps {
  roomPreview: RoomPreview
}

const props = defineProps<RoomInvitationProps>()

const roomStore = useRoomStore()
const actionFeedbackStore = useActionFeedbackStore()

const isJoiningRoom = ref(false)

async function handleJoinButtonClick() {
  isJoiningRoom.value = true
  try {
    await roomStore.joinRequestedRoom()
    actionFeedbackStore.showSuccessFeedback(
      `You joined ${props.roomPreview.name}`,
      'It is saved in your rooms, so you can come back any time.',
    )
  } catch (joinError) {
    actionFeedbackStore.showErrorFeedback(
      'Could not join the room',
      describeError(joinError, 'Something went wrong. Please try again.'),
    )
  } finally {
    isJoiningRoom.value = false
  }
}
</script>

<template>
  <BaseCard class="mx-auto flex w-full max-w-md flex-col items-center gap-4 text-center">
    <BaseAvatar :name="roomPreview.ownerName" :image-url="roomPreview.ownerAvatarUrl" size="lg" />
    <div class="flex flex-col gap-1">
      <BaseText size="sm" tone="muted">{{ roomPreview.ownerName }} invited you to</BaseText>
      <BaseHeading :level="1" size="title">{{ roomPreview.name }}</BaseHeading>
      <BaseText size="sm" tone="subtle">
        {{ formatMemberCount(roomPreview.memberCount) }}
      </BaseText>
    </div>
    <BaseButton
      size="lg"
      :trailing-icon="ArrowRightIcon"
      :is-loading="isJoiningRoom"
      is-full-width
      @click="handleJoinButtonClick"
    >
      Join room
    </BaseButton>
  </BaseCard>
</template>
