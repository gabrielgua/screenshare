<script setup lang="ts">
import AdminNavigation from '@/components/admin/AdminNavigation.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageTransition from '@/components/layout/PageTransition.vue'
</script>

<template>
  <PageContainer>
    <AdminNavigation />
    <RouterView v-slot="{ Component, route }">
      <PageTransition>
        <component :is="Component" :key="route.path" />
      </PageTransition>
    </RouterView>
  </PageContainer>
</template>
