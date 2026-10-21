<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import { HomeIcon } from '@/theme/app-icons'

const router = useRouter()

function handleHomeButtonClick() {
  router.push({ name: 'home' })
}
</script>

<template>
  <BaseButton
    variant="neutral"
    appearance="ghost"
    :leading-icon="HomeIcon"
    aria-label="Home"
    @click="handleHomeButtonClick"
  >
    <span class="hidden sm:inline">Home</span>
  </BaseButton>
</template>
