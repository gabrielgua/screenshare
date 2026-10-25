<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import BaseBadge from '@/components/badge/BaseBadge.vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { RoomMember } from '@/services/rooms-service'
import { RoomBlockedUserIcon, RoomOwnerIcon } from '@/theme/app-icons'
import KickRoomMemberButton from './KickRoomMemberButton.vue'
import RoomPresenceAvatar from './RoomPresenceAvatar.vue'

interface RoomMemberCardProps {
  roomMember: RoomMember
  isCurrentUser?: boolean
  canBeManaged?: boolean
  isPresent?: boolean
}

const props = withDefaults(defineProps<RoomMemberCardProps>(), {
  isCurrentUser: false,
  canBeManaged: false,
  isPresent: false,
})

const emit = defineEmits<{
  blockRequested: []
}>()

const timeSinceJoining = useTimeAgo(() => props.roomMember.joinedAt)

function handleBlockButtonClick() {
  emit('blockRequested')
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
    <div v-if="canBeManaged" class="flex shrink-0 items-center gap-1">
      <KickRoomMemberButton
        v-if="isPresent"
        :member-user-id="roomMember.userId"
        :member-name="roomMember.displayName"
      />
      <BaseIconButton
        :icon="RoomBlockedUserIcon"
        :accessible-label="`Block ${roomMember.displayName}`"
        variant="danger"
        appearance="ghost"
        size="sm"
        @click="handleBlockButtonClick"
      />
    </div>
  </BaseCard>
</template>
