<script setup lang="ts">
import { computed } from 'vue'
import BaseAvatarStack, { type AvatarStackPerson } from '@/components/avatar/BaseAvatarStack.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { PresentRoomUser } from '@/services/room-presence-service'

interface RoomLivePresenceProps {
  presentUsers: PresentRoomUser[]
  isCondensedOnPhones?: boolean
}

const props = withDefaults(defineProps<RoomLivePresenceProps>(), {
  isCondensedOnPhones: false,
})

const presentUserCount = computed(() => props.presentUsers.length)
const hasPresentUsers = computed(() => presentUserCount.value > 0)
const presentPeople = computed<AvatarStackPerson[]>(() =>
  props.presentUsers.map((presentUser) => ({
    id: presentUser.userId,
    name: presentUser.displayName,
    imageUrl: presentUser.avatarUrl,
  })),
)
</script>

<template>
  <div
    class="min-h-8 items-center gap-2"
    :class="isCondensedOnPhones && !hasPresentUsers ? 'hidden sm:flex' : 'flex'"
    aria-live="polite"
  >
    <BaseAvatarStack v-if="hasPresentUsers" :people="presentPeople" />
    <span v-if="hasPresentUsers" class="relative flex size-2 shrink-0" aria-hidden="true">
      <span
        class="absolute inline-flex size-full animate-ping rounded-full bg-success-400 opacity-75 motion-reduce:animate-none"
      />
      <span class="relative inline-flex size-2 rounded-full bg-success-500" />
    </span>
    <BaseText
      as="span"
      size="caption"
      weight="medium"
      :tone="hasPresentUsers ? 'success' : 'subtle'"
    >
      <template v-if="hasPresentUsers">
        {{ presentUserCount
        }}<span :class="{ 'hidden sm:inline': isCondensedOnPhones }">&nbsp;here now</span>
      </template>
      <template v-else>Nobody here right now</template>
    </BaseText>
  </div>
</template>
