<script setup lang="ts">
import { useColorScheme } from '@/composables/use-color-scheme'
import { useAuthenticationStore } from '@/stores/authentication-store'

useColorScheme()
useAuthenticationStore().restoreSession()
</script>

<template>
  <RouterView />
</template>
