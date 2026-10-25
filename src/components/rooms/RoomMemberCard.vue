<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import BaseBadge from '@/components/badge/BaseBadge.vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { RoomMember } from '@/services/rooms-service'
import { RemoveRoomMemberIcon, RoomOwnerIcon } from '@/theme/app-icons'
import RoomPresenceAvatar from './RoomPresenceAvatar.vue'

interface RoomMemberCardProps {
  roomMember: RoomMember
  isCurrentUser?: boolean
  canBeRemoved?: boolean
  isPresent?: boolean
}

const props = withDefaults(defineProps<RoomMemberCardProps>(), {
  isCurrentUser: false,
  canBeRemoved: false,
  isPresent: false,
})

const emit = defineEmits<{
  removalRequested: []
}>()

const timeSinceJoining = useTimeAgo(() => props.roomMember.joinedAt)

function handleRemoveButtonClick() {
  emit('removalRequested')
}
</script>

<template>
  <BaseCard as="article" padding="compact" class="flex h-full items-center gap-3">
    <RoomPresenceAvatar
      :name="roomMember.displayName"
      :image-url="roomMember.avatarUrl"
      :is-present="isPresent"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      <div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <BaseText weight="semibold" class="truncate">
          {{ roomMember.displayName }}
          <BaseText v-if="isCurrentUser" as="span" weight="medium" tone="subtle">(You)</BaseText>
        </BaseText>
        <BaseBadge v-if="roomMember.isOwner" appearance="soft" :icon="RoomOwnerIcon">
          Owner
        </BaseBadge>
      </div>
      <BaseText v-if="isPresent" size="caption" weight="medium" tone="success">Here now</BaseText>
      <BaseText v-else size="caption" tone="subtle">Joined {{ timeSinceJoining }}</BaseText>
    </div>
    <BaseIconButton
      v-if="canBeRemoved"
      :icon="RemoveRoomMemberIcon"
      :accessible-label="`Remove ${roomMember.displayName} from the room`"
      variant="danger"
      appearance="ghost"
      @click="handleRemoveButtonClick"
    />
  </BaseCard>
</template>
