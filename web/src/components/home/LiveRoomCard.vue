<script setup lang="ts">
import { computed } from 'vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import RoomLivePresence from '@/components/rooms/RoomLivePresence.vue'
import BaseLinkCard from '@/components/surface/BaseLinkCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { describeWhoIsSharing } from '@/formatting/sharing-summary'
import type { PresentRoomUser } from '@/services/room-presence-service'
import type { RoomSummary } from '@/services/rooms-service'
import { RoomIcon, ShareScreenIcon } from '@/theme/app-icons'

interface LiveRoomCardProps {
  roomSummary: RoomSummary
  presentUsers: PresentRoomUser[]
}

const props = defineProps<LiveRoomCardProps>()

const sharingSummary = computed(() =>
  describeWhoIsSharing(
    props.presentUsers
      .filter((presentUser) => presentUser.isSharingScreen)
      .map((presentUser) => presentUser.displayName),
  ),
)
</script>

<template>
  <BaseLinkCard :destination="{ name: 'room', params: { roomId: roomSummary.id } }">
    <template #leading>
      <BaseIconCircle
        :icon="sharingSummary ? ShareScreenIcon : RoomIcon"
        :variant="sharingSummary ? 'primary' : 'success'"
        size="sm"
      />
    </template>
    <BaseText weight="semibold" class="truncate">{{ roomSummary.name }}</BaseText>
    <BaseText size="sm" :tone="sharingSummary ? 'brand' : 'muted'" class="truncate">
      {{ sharingSummary ?? 'Hanging out, nobody is sharing yet' }}
    </BaseText>
    <template #trailing>
      <RoomLivePresence :present-users="presentUsers" is-condensed-on-phones class="shrink-0" />
    </template>
  </BaseLinkCard>
</template>
