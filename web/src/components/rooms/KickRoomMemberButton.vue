<script setup lang="ts">
import { ref } from 'vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import ConfirmActionModal from '@/components/feedback/ConfirmActionModal.vue'
import { describeError } from '@/services/describe-error'
import { useActionFeedbackStore } from '@/stores/action-feedback-store'
import { useRoomStore } from '@/stores/room-store'
import { KickRoomMemberIcon } from '@/theme/app-icons'

interface KickRoomMemberButtonProps {
  memberUserId: string
  memberName: string
}

defineOptions({ inheritAttrs: false })

const props = defineProps<KickRoomMemberButtonProps>()

const roomStore = useRoomStore()
const actionFeedbackStore = useActionFeedbackStore()

const isKickModalOpen = ref(false)
const isKickingMember = ref(false)

function handleKickButtonClick() {
  isKickModalOpen.value = true
}

async function handleKickConfirmed() {
  isKickingMember.value = true
  try {
    await roomStore.kickMemberFromRequestedRoom(props.memberUserId)
    isKickModalOpen.value = false
    actionFeedbackStore.showSuccessFeedback(
      `${props.memberName} was kicked`,
      'They were sent out of the room. They are still a member and can come back.',
    )
  } catch (kickError) {
    actionFeedbackStore.showErrorFeedback(
      'Could not kick this member',
      describeError(kickError, 'Something went wrong. Please try again.'),
    )
  } finally {
    isKickingMember.value = false
  }
}
</script>

<template>
  <BaseIconButton
    v-bind="$attrs"
    :icon="KickRoomMemberIcon"
    :accessible-label="`Kick ${memberName} from the room`"
    tooltip-placement="left"
    variant="warning"
    appearance="ghost"
    size="sm"
    @click="handleKickButtonClick"
  />
  <ConfirmActionModal
    v-model:open="isKickModalOpen"
    :title="`Kick ${memberName}?`"
    description="They are sent out of the room right now. They stay a member and can come back whenever they want. To keep them out, block them instead."
    confirm-label="Kick"
    :icon="KickRoomMemberIcon"
    variant="warning"
    :is-submitting="isKickingMember"
    @confirmed="handleKickConfirmed"
  />
</template>
