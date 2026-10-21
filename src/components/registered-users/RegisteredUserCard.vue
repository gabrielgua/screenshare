<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { PlatformUser } from '@/services/users-service'
import { ArrowRightIcon } from '@/theme/app-icons'
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
  <RouterLink
    :to="{ name: 'admin-user-details', params: { userId: registeredUser.id } }"
    class="group block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
  >
    <BaseCard
      as="article"
      padding="compact"
      class="flex items-center gap-3 transition-colors duration-150 group-hover:border-brand-300 dark:group-hover:border-brand-700"
      :class="{ 'opacity-70': !registeredUser.isActive }"
    >
      <BaseAvatar :name="registeredUser.displayName" :image-url="registeredUser.avatarUrl" />
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
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
      </div>
      <BaseIcon
        :icon="ArrowRightIcon"
        size="md"
        class="shrink-0 text-neutral-400 transition-transform duration-150 group-hover:translate-x-0.5 dark:text-neutral-500"
      />
    </BaseCard>
  </RouterLink>
</template>
