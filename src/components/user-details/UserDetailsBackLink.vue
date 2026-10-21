<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import { ArrowLeftIcon } from '@/theme/app-icons'

const router = useRouter()

function handleBackButtonClick() {
  router.push({ name: 'admin-users' })
}
</script>

<template>
  <BaseButton
    variant="neutral"
    appearance="ghost"
    size="sm"
    :leading-icon="ArrowLeftIcon"
    class="-ml-2 self-start"
    @click="handleBackButtonClick"
  >
    All users
  </BaseButton>
</template>
