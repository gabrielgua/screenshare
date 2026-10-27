<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import RoomLivePresence from '@/components/rooms/RoomLivePresence.vue'
import ShareRoomLinkButton from '@/components/rooms/ShareRoomLinkButton.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { PresentRoomUser } from '@/services/room-presence-service'
import { RedirectLinkIcon, RoomIcon } from '@/theme/app-icons'

interface RoomDetailsHeaderProps {
  roomId: string
  roomName: string
  ownerName: string
  ownerAvatarUrl?: string
  presentUsers?: PresentRoomUser[]
}

const props = withDefaults(defineProps<RoomDetailsHeaderProps>(), {
  ownerAvatarUrl: undefined,
  presentUsers: () => [],
})

const router = useRouter()

function handleOpenRoomButtonClick() {
  router.push({ name: 'room', params: { roomId: props.roomId } })
}
</script>

<template>
  <BaseCard class="flex flex-col gap-4 sm:flex-row sm:items-center">
    <div
      class="flex min-w-0 flex-1 flex-col items-center gap-4 text-center sm:flex-row sm:text-left"
    >
      <BaseIconCircle :icon="RoomIcon" size="lg" />
      <div class="flex min-w-0 max-w-full flex-col items-center gap-2 sm:items-start">
        <BaseHeading :level="1" size="title" class="max-w-full truncate">
          {{ roomName }}
        </BaseHeading>
        <div class="flex items-center gap-2">
          <BaseAvatar :name="ownerName" :image-url="ownerAvatarUrl" size="sm" />
          <BaseText size="sm" tone="muted">Created by {{ ownerName }}</BaseText>
        </div>
        <RoomLivePresence :present-users="presentUsers" />
      </div>
    </div>
    <div class="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
      <BaseButton
        variant="neutral"
        appearance="outlined"
        :leading-icon="RedirectLinkIcon"
        @click="handleOpenRoomButtonClick"
      >
        Open room
      </BaseButton>
      <ShareRoomLinkButton :room-id="roomId" />
    </div>
  </BaseCard>
</template>
