<script setup lang="ts">
import AdminRoleLabel from '@/components/admin/AdminRoleLabel.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import SignedInUserAvatar from './SignedInUserAvatar.vue'

const { displayName } = useAuthenticationStore()
const currentUserStore = useCurrentUserStore()
</script>

<template>
  <div class="flex items-center gap-2">
    <SignedInUserAvatar size="sm" />
    <div class="hidden max-w-40 flex-col sm:flex">
      <BaseText as="span" size="sm" weight="semibold" class="truncate flex items-center gap-1">
        {{ displayName }}
        <AdminRoleLabel v-if="currentUserStore.isAdmin" />
      </BaseText>
    </div>
  </div>
</template>
