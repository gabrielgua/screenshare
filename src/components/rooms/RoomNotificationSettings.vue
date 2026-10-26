<script setup lang="ts">
import { storeToRefs } from 'pinia'
import BaseSwitch from '@/components/form/BaseSwitch.vue'
import { useRoomNotificationPreferencesStore } from '@/stores/room-notification-preferences-store'
import { NotificationsOnIcon, SoundOnIcon } from '@/theme/app-icons'
import RoomCollapsibleSection from './RoomCollapsibleSection.vue'

const { shouldShowToasts, shouldPlaySounds } = storeToRefs(useRoomNotificationPreferencesStore())
</script>

<template>
  <RoomCollapsibleSection title="Notifications" description="When someone joins or leaves.">
    <div class="flex flex-col">
      <BaseSwitch
        v-model="shouldShowToasts"
        label="Show notifications"
        :icon="NotificationsOnIcon"
      />
      <BaseSwitch v-model="shouldPlaySounds" label="Play a sound" :icon="SoundOnIcon" />
    </div>
  </RoomCollapsibleSection>
</template>
