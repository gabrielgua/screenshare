<script setup lang="ts">
import AdminDetailsActionRow from '@/components/admin/AdminDetailsActionRow.vue'
import AdminDetailsSection from '@/components/admin/AdminDetailsSection.vue'
import RenameRoomButton from '@/components/rooms/RenameRoomButton.vue'

interface RoomManagementActionsProps {
  roomName: string
}

defineProps<RoomManagementActionsProps>()
</script>

<template>
  <AdminDetailsSection title="Actions">
    <AdminDetailsActionRow
      title="Room name"
      description="Rename the room. Members see the new name right away."
    >
      <RenameRoomButton :room-name="roomName" class="w-full sm:w-auto" />
    </AdminDetailsActionRow>
  </AdminDetailsSection>
</template>
