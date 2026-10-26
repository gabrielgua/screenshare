<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import type { PresentRoomUser } from '@/services/room-presence-service'
import type { Room } from '@/services/rooms-service'
import { CollapseSidebarIcon, ExpandSidebarIcon } from '@/theme/app-icons'
import RoomCollapsedPresence from './RoomCollapsedPresence.vue'
import RoomDetailsPanel from './RoomDetailsPanel.vue'
import RoomOwnerLabel from './RoomOwnerLabel.vue'

interface RoomSidebarProps {
  room: Room
  ownerName?: string
  presentUsers: PresentRoomUser[]
  presentUserIds: string[]
}

withDefaults(defineProps<RoomSidebarProps>(), {
  ownerName: undefined,
})

const isSidebarCollapsed = useLocalStorage('screenshare-room-sidebar-collapsed', false)

function handleCollapseButtonClick() {
  isSidebarCollapsed.value = true
}

function handleExpandButtonClick() {
  isSidebarCollapsed.value = false
}
</script>

<template>
  <BaseCard
    as="aside"
    padding="none"
    aria-label="Room details"
    class="hidden shrink-0 box-content flex-col overflow-hidden transition-[width] duration-300 ease-bounce motion-reduce:transition-none lg:flex"
    :class="isSidebarCollapsed ? 'w-20' : 'w-80'"
  >
    <div
      v-if="isSidebarCollapsed"
      class="flex min-h-0 w-20 flex-1 shrink-0 flex-col items-center gap-4 py-4"
    >
      <BaseIconButton
        :icon="ExpandSidebarIcon"
        accessible-label="Expand the sidebar"
        variant="neutral"
        appearance="ghost"
        size="sm"
        @click="handleExpandButtonClick"
      />
      <RoomCollapsedPresence :present-users="presentUsers" />
    </div>
    <div v-else class="flex min-h-0 w-80 flex-1 shrink-0 flex-col gap-4 p-4">
      <header class="flex items-start gap-3">
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <BaseHeading :level="1" size="subtitle" class="break-words">{{ room.name }}</BaseHeading>
          <RoomOwnerLabel v-if="ownerName" :owner-name="ownerName" />
        </div>
        <BaseIconButton
          :icon="CollapseSidebarIcon"
          accessible-label="Collapse the sidebar"
          variant="neutral"
          appearance="ghost"
          size="sm"
          class="-mt-1 -mr-2"
          @click="handleCollapseButtonClick"
        />
      </header>
      <RoomDetailsPanel
        :room="room"
        :present-users="presentUsers"
        :present-user-ids="presentUserIds"
      />
    </div>
  </BaseCard>
</template>
