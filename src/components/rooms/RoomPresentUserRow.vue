<script setup lang="ts">
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { PresentRoomUser } from '@/services/room-presence-service'
import { RoomOwnerIcon } from '@/theme/app-icons'
import RoomPresenceAvatar from './RoomPresenceAvatar.vue'

interface RoomPresentUserRowProps {
  presentUser: PresentRoomUser
  isCurrentUser?: boolean
  isRoomOwner?: boolean
}

withDefaults(defineProps<RoomPresentUserRowProps>(), {
  isCurrentUser: false,
  isRoomOwner: false,
})
</script>

<template>
  <div class="flex items-center gap-3 py-1.5">
    <RoomPresenceAvatar
      :name="presentUser.displayName"
      :image-url="presentUser.avatarUrl"
      size="sm"
      is-present
    />
    <BaseText size="sm" weight="medium" class="min-w-0 flex-1 truncate">
      {{ presentUser.displayName }}
      <BaseText v-if="isCurrentUser" as="span" size="sm" tone="subtle">(You)</BaseText>
    </BaseText>
    <BaseIcon
      v-if="isRoomOwner"
      :icon="RoomOwnerIcon"
      size="sm"
      class="shrink-0 text-brand-600 dark:text-brand-300"
      aria-label="Room owner"
    />
  </div>
</template>
