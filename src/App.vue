<script setup lang="ts">
import ActionFeedbackModal from '@/components/feedback/ActionFeedbackModal.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import PageTransition from '@/components/layout/PageTransition.vue'
import { useColorScheme } from '@/composables/use-color-scheme'
import { useAuthenticationStore } from '@/stores/authentication-store'

useColorScheme()
useAuthenticationStore().restoreSession()
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <AppHeader />
    <div class="flex flex-1 flex-col overflow-clip">
      <RouterView v-slot="{ Component, route }">
        <PageTransition>
          <component :is="Component" :key="route.path" />
        </PageTransition>
      </RouterView>
    </div>
    <ActionFeedbackModal />
  </div>
</template>
