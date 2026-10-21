<script setup lang="ts">
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'
import type { ControlSize } from '@/theme/component-sizes'

interface SignedInUserAvatarProps {
  size?: ControlSize
}

withDefaults(defineProps<SignedInUserAvatarProps>(), {
  size: 'md',
})

const authenticationStore = useAuthenticationStore()
</script>

<template>
  <BaseAvatar
    :name="authenticationStore.displayName"
    :image-url="authenticationStore.avatarUrl"
    :size="size"
  />
</template>
