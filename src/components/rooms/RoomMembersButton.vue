<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import { useRoomStore } from '@/stores/room-store'
import { ParticipantsIcon } from '@/theme/app-icons'
import RoomBlockedUsersSection from './RoomBlockedUsersSection.vue'
import RoomMembersSection from './RoomMembersSection.vue'

interface RoomMembersButtonProps {
  roomName: string
  presentUserIds: string[]
}

defineOptions({ inheritAttrs: false })

defineProps<RoomMembersButtonProps>()

const roomStore = useRoomStore()

const isMembersDialogOpen = ref(false)

function handleMembersButtonClick() {
  isMembersDialogOpen.value = true
}
</script>

<template>
  <BaseButton
    v-bind="$attrs"
    variant="neutral"
    appearance="outlined"
    :leading-icon="ParticipantsIcon"
    @click="handleMembersButtonClick"
  >
    Members ({{ roomStore.roomMembers.length }})
  </BaseButton>
  <BaseDialog v-model:open="isMembersDialogOpen" :title="roomName" width="wide">
    <div class="flex flex-col gap-6">
      <RoomMembersSection :present-user-ids="presentUserIds" />
      <RoomBlockedUsersSection
        v-if="roomStore.canManageRoom && roomStore.roomBlockedUsers.length > 0"
      />
    </div>
  </BaseDialog>
</template>
