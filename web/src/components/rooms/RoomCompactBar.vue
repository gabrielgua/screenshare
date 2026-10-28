<script setup lang="ts">
import { ref } from 'vue'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import BaseDrawer from '@/components/dialog/BaseDrawer.vue'
import BaseSegmentedControl, {
  type SegmentedControlOption,
} from '@/components/segmented-control/BaseSegmentedControl.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import type { PresentRoomUser } from '@/services/room-presence-service'
import type { Room } from '@/services/rooms-service'
import { useRoomStore } from '@/stores/room-store'
import { InformationIcon, ParticipantsIcon, RoomIcon } from '@/theme/app-icons'
import RoomBlockedUsersSection from './RoomBlockedUsersSection.vue'
import RoomDetailsPanel from './RoomDetailsPanel.vue'
import RoomLivePresence from './RoomLivePresence.vue'
import RoomMembersSection from './RoomMembersSection.vue'
import RoomOwnerLabel from './RoomOwnerLabel.vue'
import ShareRoomLinkButton from './ShareRoomLinkButton.vue'

export type RoomDrawerTab = 'room' | 'members'

interface RoomCompactBarProps {
  room: Room
  ownerName?: string
  presentUsers: PresentRoomUser[]
  presentUserIds: string[]
}

withDefaults(defineProps<RoomCompactBarProps>(), {
  ownerName: undefined,
})

const roomStore = useRoomStore()

const ROOM_DRAWER_TABS: SegmentedControlOption<RoomDrawerTab>[] = [
  { value: 'room', label: 'Room', icon: RoomIcon },
  { value: 'members', label: 'Members', icon: ParticipantsIcon },
]

const isDetailsDrawerOpen = ref(false)
const selectedDrawerTab = ref<RoomDrawerTab>('room')

function handleDetailsButtonClick() {
  selectedDrawerTab.value = 'room'
  isDetailsDrawerOpen.value = true
}
</script>

<template>
  <section
    aria-label="Room"
    class="-mx-4 -mt-4 border-b border-neutral-200 bg-white sm:-mx-6 sm:-mt-6 short-landscape:-mt-2 lg:hidden dark:border-neutral-800 dark:bg-neutral-900"
  >
    <div class="flex items-center gap-3 px-4 py-2.5 sm:px-6 short-landscape:py-1.5">
      <div
        class="flex min-w-0 flex-1 flex-col short-landscape:flex-row short-landscape:items-center short-landscape:gap-3"
      >
        <BaseHeading :level="1" size="section" class="truncate">{{ room.name }}</BaseHeading>
        <RoomLivePresence :present-users="presentUsers" />
      </div>
      <ShareRoomLinkButton :room-id="room.id" is-icon-only size="sm" class="shrink-0" />
      <BaseIconButton
        :icon="InformationIcon"
        accessible-label="Room details"
        tooltip-placement="bottom"
        tooltip-alignment="end"
        variant="neutral"
        appearance="outlined"
        size="sm"
        class="shrink-0"
        @click="handleDetailsButtonClick"
      />
    </div>
    <BaseDrawer v-model:open="isDetailsDrawerOpen" :title="room.name">
      <template #header>
        <RoomOwnerLabel v-if="ownerName" :owner-name="ownerName" class="-mt-2" />
        <BaseSegmentedControl
          v-model="selectedDrawerTab"
          :options="ROOM_DRAWER_TABS"
          kind="tabs"
          accessible-label="Room details sections"
          class="mt-1"
        />
      </template>
      <RoomDetailsPanel
        v-if="selectedDrawerTab === 'room'"
        :room="room"
        :present-users="presentUsers"
        :present-user-ids="presentUserIds"
        :has-members-button="false"
      />
      <div v-else class="flex flex-col gap-6">
        <RoomMembersSection :present-user-ids="presentUserIds" />
        <RoomBlockedUsersSection
          v-if="roomStore.canManageRoom && roomStore.roomBlockedUsers.length > 0"
        />
      </div>
    </BaseDrawer>
  </section>
</template>
