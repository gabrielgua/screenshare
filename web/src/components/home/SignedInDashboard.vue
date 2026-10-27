<script setup lang="ts">
import { onMounted } from 'vue'
import ReviewMessageCard from '@/components/account-status/ReviewMessageCard.vue'
import DesktopAppPromotionCard from '@/components/desktop-app/DesktopAppPromotionCard.vue'
import { canInstallDesktopApp } from '@/media/desktop-bridge'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { useMyRoomsStore } from '@/stores/my-rooms-store'
import GettingStartedSection from './GettingStartedSection.vue'
import HomeHero from './HomeHero.vue'
import LiveRoomsSection from './LiveRoomsSection.vue'

const currentUserStore = useCurrentUserStore()
const myRoomsStore = useMyRoomsStore()
const shouldOfferDesktopApp = canInstallDesktopApp()

onMounted(() => {
  myRoomsStore.loadMyRooms()
})
</script>

<template>
  <div class="flex w-full flex-col gap-10 sm:gap-12">
    <HomeHero />
    <DesktopAppPromotionCard v-if="shouldOfferDesktopApp" />
    <ReviewMessageCard
      v-if="currentUserStore.currentUser?.reviewMessage"
      label="Message from the admin"
      :message="currentUserStore.currentUser.reviewMessage"
    />
    <LiveRoomsSection v-if="myRoomsStore.hasRooms" />
    <GettingStartedSection v-else-if="myRoomsStore.hasLoadedMyRooms" />
  </div>
</template>
