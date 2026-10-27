<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import BaseBadge from '@/components/badge/BaseBadge.vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseLinkCard from '@/components/surface/BaseLinkCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import RoomLivePresence from '@/components/rooms/RoomLivePresence.vue'
import { useRoomPresence } from '@/composables/use-room-presence'
import { formatMemberCount } from '@/formatting/member-count'
import type { AdministeredRoom } from '@/services/rooms-service'
import { RoomBlockedUserIcon, RoomIcon, RoomOwnerIcon } from '@/theme/app-icons'

interface AdministeredRoomCardProps {
  administeredRoom: AdministeredRoom
  isOwnedByCurrentUser?: boolean
}

const props = withDefaults(defineProps<AdministeredRoomCardProps>(), {
  isOwnedByCurrentUser: false,
})

const timeSinceCreation = useTimeAgo(() => props.administeredRoom.createdAt)
const { presentUsers } = useRoomPresence(() => props.administeredRoom.id)
</script>

<template>
  <BaseLinkCard
    :destination="{ name: 'admin-room-details', params: { roomId: administeredRoom.id } }"
  >
    <template #leading>
      <BaseIconCircle :icon="RoomIcon" size="sm" />
    </template>
    <div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <BaseText weight="semibold" class="truncate">{{ administeredRoom.name }}</BaseText>
      <BaseBadge v-if="isOwnedByCurrentUser" appearance="soft" :icon="RoomOwnerIcon">
        Yours
      </BaseBadge>
      <BaseBadge
        v-if="administeredRoom.blockedUserCount > 0"
        appearance="soft"
        variant="danger"
        :icon="RoomBlockedUserIcon"
      >
        {{ administeredRoom.blockedUserCount }} blocked
      </BaseBadge>
    </div>
    <BaseText size="sm" tone="muted" class="truncate">
      By {{ administeredRoom.ownerName }} · {{ formatMemberCount(administeredRoom.memberCount) }}
    </BaseText>
    <BaseText size="caption" tone="subtle">Created {{ timeSinceCreation }}</BaseText>
    <template #trailing>
      <RoomLivePresence :present-users="presentUsers" is-condensed-on-phones class="shrink-0" />
    </template>
  </BaseLinkCard>
</template>
