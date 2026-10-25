<script setup lang="ts">
import StaggeredListTransition from '@/components/layout/StaggeredListTransition.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { PresentRoomUser } from '@/services/room-presence-service'
import RoomPresenceAvatar from './RoomPresenceAvatar.vue'

interface RoomCollapsedPresenceProps {
  presentUsers: PresentRoomUser[]
}

defineProps<RoomCollapsedPresenceProps>()
</script>

<template>
  <section
    class="flex min-h-0 flex-1 flex-col items-center gap-3 self-stretch"
    :aria-label="`${presentUsers.length} here now`"
  >
    <BaseText size="caption" weight="semibold" tone="success">{{ presentUsers.length }}</BaseText>
    <StaggeredListTransition
      tag="ul"
      class="scrollbar-thin-on-hover scrollbar-gutter-balanced flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-x-hidden overflow-y-auto pb-1"
    >
      <li
        v-for="(presentUser, listPosition) in presentUsers"
        :key="presentUser.userId"
        :data-stagger-index="listPosition"
        :title="presentUser.displayName"
      >
        <RoomPresenceAvatar
          :name="presentUser.displayName"
          :image-url="presentUser.avatarUrl"
          is-present
        />
      </li>
    </StaggeredListTransition>
  </section>
</template>
