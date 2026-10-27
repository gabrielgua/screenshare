<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import SignedInUserAvatar from '@/components/authentication/SignedInUserAvatar.vue'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import CreateRoomButton from '@/components/rooms/CreateRoomButton.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { describeTimeOfDayGreeting } from '@/formatting/greeting'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useMyRoomsStore } from '@/stores/my-rooms-store'
import { InviteLinkIcon, RoomIcon } from '@/theme/app-icons'
import JoinRoomForm from './JoinRoomForm.vue'

const router = useRouter()
const authenticationStore = useAuthenticationStore()
const myRoomsStore = useMyRoomsStore()

const greeting = describeTimeOfDayGreeting(new Date())
const ownedRoom = computed(() => myRoomsStore.myRooms.find((roomSummary) => roomSummary.isOwner))

function handleOpenOwnedRoomButtonClick() {
  if (ownedRoom.value) {
    router.push({ name: 'room', params: { roomId: ownedRoom.value.id } })
  }
}

function handleAllRoomsButtonClick() {
  router.push({ name: 'rooms' })
}
</script>

<template>
  <section class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
    <div class="flex max-w-xl flex-col gap-5">
      <div class="flex items-center gap-3">
        <SignedInUserAvatar size="sm" />
        <BaseText as="span" weight="semibold" tone="brand">
          {{ greeting }}, {{ authenticationStore.displayName }}
        </BaseText>
      </div>
      <div class="flex flex-col gap-3">
        <BaseHeading :level="1" size="display">Share your screen with your friends</BaseHeading>
        <BaseText size="lg" tone="muted">
          Start a room, send the link and go live. Everyone in the room sees your screen in seconds.
        </BaseText>
      </div>
      <div class="grid gap-3 sm:flex sm:flex-wrap">
        <CreateRoomButton v-if="myRoomsStore.canCreateRoom" size="lg" />
        <BaseButton
          v-else-if="ownedRoom"
          size="lg"
          :leading-icon="RoomIcon"
          @click="handleOpenOwnedRoomButtonClick"
        >
          Open your room
        </BaseButton>
        <BaseButton
          variant="neutral"
          appearance="outlined"
          size="lg"
          :leading-icon="RoomIcon"
          @click="handleAllRoomsButtonClick"
        >
          All your rooms
        </BaseButton>
      </div>
    </div>
    <BaseCard as="aside" class="flex w-full flex-col gap-4 lg:max-w-sm">
      <div class="flex items-center gap-3">
        <BaseIconCircle :icon="InviteLinkIcon" size="sm" />
        <div class="flex min-w-0 flex-col">
          <BaseHeading :level="2" size="section">Got a link?</BaseHeading>
          <BaseText size="sm" tone="muted">Paste it to join your friends.</BaseText>
        </div>
      </div>
      <JoinRoomForm />
    </BaseCard>
  </section>
</template>
