<script setup lang="ts">
import { useRouter, type RouteLocationRaw } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import { ArrowLeftIcon } from '@/theme/app-icons'

interface AdminBackLinkProps {
  destination: RouteLocationRaw
  label: string
}

const props = defineProps<AdminBackLinkProps>()

const router = useRouter()

function handleBackButtonClick() {
  router.push(props.destination)
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
    {{ label }}
  </BaseButton>
</template>
