<script setup lang="ts">
import BaseAvatar from '@/components/avatar/BaseAvatar.vue'
import UserStatusBadges from '@/components/registered-users/UserStatusBadges.vue'
import BaseCard from '@/components/surface/BaseCard.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { PlatformUserDetails } from '@/services/users-service'

interface UserDetailsHeaderProps {
  viewedUser: PlatformUserDetails
  isCurrentUser?: boolean
}

withDefaults(defineProps<UserDetailsHeaderProps>(), {
  isCurrentUser: false,
})
</script>

<template>
  <BaseCard class="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
    <BaseAvatar :name="viewedUser.displayName" :image-url="viewedUser.avatarUrl" size="lg" />
    <div class="flex min-w-0 flex-col items-center gap-2 sm:items-start">
      <BaseHeading :level="1" size="title" class="max-w-full truncate">
        {{ viewedUser.displayName }}
        <BaseText v-if="isCurrentUser" as="span" size="lg" weight="medium" tone="subtle">
          (You)
        </BaseText>
      </BaseHeading>
      <UserStatusBadges :user="viewedUser" />
    </div>
  </BaseCard>
</template>
