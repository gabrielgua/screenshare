<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseLinkCard from '@/components/surface/BaseLinkCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { PlatformUser } from '@/services/users-service'
import UserStatusBadges from './UserStatusBadges.vue'

interface RegisteredUserCardProps {
  registeredUser: PlatformUser
  isCurrentUser?: boolean
}

const props = withDefaults(defineProps<RegisteredUserCardProps>(), {
  isCurrentUser: false,
})

const timeSinceSignUp = useTimeAgo(() => props.registeredUser.createdAt)
</script>

<template>
  <BaseLinkCard
    :destination="{ name: 'admin-user-details', params: { userId: registeredUser.id } }"
    :class="{ 'opacity-70': !registeredUser.isActive }"
  >
    <template #leading>
      <BaseAvatar :name="registeredUser.displayName" :image-url="registeredUser.avatarUrl" />
    </template>
    <div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
      <BaseText weight="semibold" class="truncate">
        {{ registeredUser.displayName }}
        <BaseText v-if="isCurrentUser" as="span" weight="medium" tone="subtle">(You)</BaseText>
      </BaseText>
      <UserStatusBadges :user="registeredUser" />
    </div>
    <BaseText v-if="registeredUser.email" size="sm" tone="muted" class="truncate">
      {{ registeredUser.email }}
    </BaseText>
    <BaseText size="caption" tone="subtle">Joined {{ timeSinceSignUp }}</BaseText>
  </BaseLinkCard>
</template>
