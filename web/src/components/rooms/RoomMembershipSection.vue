<script setup lang="ts">
import QuitRoomButton from './QuitRoomButton.vue'
import RoomCollapsibleSection from './RoomCollapsibleSection.vue'

interface RoomMembershipSectionProps {
  roomName: string
}

defineProps<RoomMembershipSectionProps>()
</script>

<template>
  <RoomCollapsibleSection
    title="Membership"
    description="Quitting removes this room from your rooms. You can join again with the link."
  >
    <QuitRoomButton :room-name="roomName" is-full-width />
  </RoomCollapsibleSection>
</template>
