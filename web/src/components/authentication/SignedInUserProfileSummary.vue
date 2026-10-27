<script setup lang="ts">
import { computed } from 'vue'
import AdminRoleLabel from '@/components/admin/AdminRoleLabel.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { formatCalendarDate } from '@/formatting/date-time'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { EmailIcon, MemberSinceIcon } from '@/theme/app-icons'
import SignedInUserAvatar from './SignedInUserAvatar.vue'
import SignedInUserProfileDetail from './SignedInUserProfileDetail.vue'

const authenticationStore = useAuthenticationStore()
const currentUserStore = useCurrentUserStore()

const email = computed(() => currentUserStore.currentUser?.email)
const memberSince = computed(() => {
  const createdAt = currentUserStore.currentUser?.createdAt
  return createdAt ? formatCalendarDate(createdAt) : undefined
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3">
      <SignedInUserAvatar size="lg" />
      <div class="flex min-w-0 flex-col gap-0.5">
        <BaseText weight="semibold" class="truncate">
          {{ authenticationStore.displayName }}
        </BaseText>
        <AdminRoleLabel v-if="currentUserStore.isAdmin" />
      </div>
    </div>
    <div v-if="email || memberSince" class="flex flex-col gap-1.5">
      <SignedInUserProfileDetail v-if="email" :icon="EmailIcon" :text="email" />
      <SignedInUserProfileDetail
        v-if="memberSince"
        :icon="MemberSinceIcon"
        :text="`Member since ${memberSince}`"
      />
    </div>
  </div>
</template>
