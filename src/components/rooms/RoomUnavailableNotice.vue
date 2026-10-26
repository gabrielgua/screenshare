<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { HomeIcon, type AppIcon } from '@/theme/app-icons'

interface RoomUnavailableNoticeProps {
  title: string
  description: string
  icon: AppIcon
}

defineProps<RoomUnavailableNoticeProps>()

const router = useRouter()

function handleHomeButtonClick() {
  router.push({ name: 'home' })
}
</script>

<template>
  <BaseCard class="mx-auto flex w-full max-w-md flex-col items-center gap-3 text-center">
    <BaseIconCircle :icon="icon" variant="neutral" size="lg" />
    <BaseHeading :level="1" size="subtitle">{{ title }}</BaseHeading>
    <BaseText size="sm" tone="muted">{{ description }}</BaseText>
    <slot>
      <BaseButton
        variant="neutral"
        appearance="outlined"
        :leading-icon="HomeIcon"
        @click="handleHomeButtonClick"
      >
        Go home
      </BaseButton>
    </slot>
  </BaseCard>
</template>
