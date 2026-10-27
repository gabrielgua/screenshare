<script setup lang="ts">
import BaseText from '@/components/typography/BaseText.vue'
import { useRoomStore } from '@/stores/room-store'

interface RoomOwnerLabelProps {
  ownerName: string
}

defineProps<RoomOwnerLabelProps>()

const roomStore = useRoomStore()
</script>

<template>
  <BaseText size="sm" tone="muted">
    {{ roomStore.isRoomOwner ? 'Your room' : `Created by ${ownerName}` }}
  </BaseText>
</template>
