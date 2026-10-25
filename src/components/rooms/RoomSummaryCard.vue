<script setup lang="ts">
import BaseBadge from '@/components/badge/BaseBadge.vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseLinkCard from '@/components/surface/BaseLinkCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { RoomSummary } from '@/services/rooms-service'
import { RoomIcon, RoomOwnerIcon } from '@/theme/app-icons'
import { useRoomPresence } from '@/composables/use-room-presence'
import RoomLivePresence from './RoomLivePresence.vue'
import { formatMemberCount } from '@/formatting/member-count'

interface RoomSummaryCardProps {
  roomSummary: RoomSummary
}

const props = defineProps<RoomSummaryCardProps>()

const { presentUsers } = useRoomPresence(() => props.roomSummary.id)
</script>

<template>
  <BaseLinkCard :destination="{ name: 'room', params: { roomId: roomSummary.id } }">
    <template #leading>
      <BaseIconCircle :icon="RoomIcon" size="sm" />
    </template>
    <div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <BaseText weight="semibold" class="truncate">{{ roomSummary.name }}</BaseText>
      <BaseBadge v-if="roomSummary.isOwner" appearance="soft" :icon="RoomOwnerIcon">
        Owner
      </BaseBadge>
    </div>
    <BaseText size="sm" tone="muted" class="truncate">
      {{ roomSummary.isOwner ? 'Your room' : `By ${roomSummary.ownerName}` }} ·
      {{ formatMemberCount(roomSummary.memberCount) }}
    </BaseText>
    <template #trailing>
      <RoomLivePresence :present-users="presentUsers" is-condensed-on-phones class="shrink-0" />
    </template>
  </BaseLinkCard>
</template>
