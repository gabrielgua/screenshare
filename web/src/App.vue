<script setup lang="ts">
import { useRoute } from 'vue-router'
import ActionFeedbackModal from '@/components/feedback/ActionFeedbackModal.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageTransition from '@/components/layout/PageTransition.vue'
import ActiveRoomSession from '@/components/rooms/ActiveRoomSession.vue'
import ToastViewport from '@/components/toast/ToastViewport.vue'
import { useAppFullscreen } from '@/composables/use-app-fullscreen'
import { useColorScheme } from '@/composables/use-color-scheme'
import { useDesktopWindowControls } from '@/composables/use-desktop-window-controls'
import { useActiveRoomStore } from '@/stores/active-room-store'
import { useAuthenticationStore } from '@/stores/authentication-store'

const route = useRoute()
const activeRoomStore = useActiveRoomStore()
const { isFullscreen: isAppFullscreen } = useAppFullscreen()

useColorScheme()
useDesktopWindowControls()
useAuthenticationStore().restoreSession()
</script>

<template>
  <div class="flex min-h-dvh flex-col" :class="{ 'h-dvh': route.meta.usesFullWidthLayout }">
    <AppHeader v-if="!isAppFullscreen" />
    <div class="flex min-h-0 flex-1 flex-col overflow-clip">
      <RouterView v-slot="{ Component, route }">
        <PageTransition>
          <component :is="Component" :key="route.matched[0]?.path ?? route.path" />
        </PageTransition>
      </RouterView>
    </div>
    <ActionFeedbackModal />
    <ToastViewport />
    <ActiveRoomSession
      v-if="activeRoomStore.activeRoom"
      :key="activeRoomStore.activeRoom.id"
      :room="activeRoomStore.activeRoom"
    />
  </div>
</template>
