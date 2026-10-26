<script setup lang="ts">
import { computed } from 'vue'
import { useTimeAgo } from '@vueuse/core'
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { RoomBlockedUser } from '@/services/rooms-service'
import { UnblockRoomUserIcon } from '@/theme/app-icons'

interface RoomBlockedUserCardProps {
  roomBlockedUser: RoomBlockedUser
}

const props = defineProps<RoomBlockedUserCardProps>()

const emit = defineEmits<{
  unblockRequested: []
}>()

const timeSinceBlocking = useTimeAgo(() => props.roomBlockedUser.blockedAt)
const blockingSummary = computed(() =>
  props.roomBlockedUser.blockedByName
    ? `Removed ${timeSinceBlocking.value} by ${props.roomBlockedUser.blockedByName}`
    : `Removed ${timeSinceBlocking.value}`,
)

function handleUnblockButtonClick() {
  emit('unblockRequested')
}
</script>

<template>
  <BaseCard as="article" padding="compact" class="flex h-full items-center gap-3">
    <BaseAvatar :name="roomBlockedUser.displayName" :image-url="roomBlockedUser.avatarUrl" />
    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      <BaseText weight="semibold" class="truncate">{{ roomBlockedUser.displayName }}</BaseText>
      <BaseText size="caption" tone="subtle" class="truncate">{{ blockingSummary }}</BaseText>
    </div>
    <BaseButton
      size="sm"
      variant="neutral"
      appearance="outlined"
      :leading-icon="UnblockRoomUserIcon"
      :aria-label="`Unblock ${roomBlockedUser.displayName}`"
      class="shrink-0"
      @click="handleUnblockButtonClick"
    >
      Unblock
    </BaseButton>
  </BaseCard>
</template>
