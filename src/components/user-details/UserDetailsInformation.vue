<script setup lang="ts">
import { computed } from 'vue'
import { useTimeAgo } from '@vueuse/core'
import BaseBadge from '@/components/badge/BaseBadge.vue'
import UserApprovalStatusBadge from '@/components/registered-users/UserApprovalStatusBadge.vue'
import UserRoleBadge from '@/components/registered-users/UserRoleBadge.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { formatDateTime } from '@/formatting/date-time'
import type { PlatformUserDetails } from '@/services/users-service'
import { InactiveIcon, SuccessIcon } from '@/theme/app-icons'
import AdminDetailsInformationRow from '@/components/admin/AdminDetailsInformationRow.vue'
import AdminDetailsSection from '@/components/admin/AdminDetailsSection.vue'

interface UserDetailsInformationProps {
  viewedUser: PlatformUserDetails
}

const props = defineProps<UserDetailsInformationProps>()

const timeSinceSignUp = useTimeAgo(() => props.viewedUser.createdAt)
const reviewMessageLabel = computed(() =>
  props.viewedUser.approvalStatus === 'denied' ? 'Reason' : 'Welcome message',
)
</script>

<template>
  <AdminDetailsSection title="Information">
    <dl class="flex flex-col">
      <AdminDetailsInformationRow label="Email">
        {{ viewedUser.email ?? 'Not shared by Discord' }}
      </AdminDetailsInformationRow>
      <AdminDetailsInformationRow label="Joined">
        {{ formatDateTime(viewedUser.createdAt) }}
        <BaseText as="span" size="sm" tone="subtle">({{ timeSinceSignUp }})</BaseText>
      </AdminDetailsInformationRow>
      <AdminDetailsInformationRow label="Role">
        <UserRoleBadge :role="viewedUser.role" />
      </AdminDetailsInformationRow>
      <AdminDetailsInformationRow label="Approval">
        <UserApprovalStatusBadge :approval-status="viewedUser.approvalStatus" />
      </AdminDetailsInformationRow>
      <AdminDetailsInformationRow label="Account">
        <BaseBadge
          appearance="soft"
          :variant="viewedUser.isActive ? 'success' : 'neutral'"
          :icon="viewedUser.isActive ? SuccessIcon : InactiveIcon"
        >
          {{ viewedUser.isActive ? 'Active' : 'Inactive' }}
        </BaseBadge>
      </AdminDetailsInformationRow>
      <AdminDetailsInformationRow v-if="viewedUser.reviewedAt" label="Reviewed">
        {{ formatDateTime(viewedUser.reviewedAt) }}
        <BaseText v-if="viewedUser.reviewerName" as="span" size="sm" tone="subtle">
          by {{ viewedUser.reviewerName }}
        </BaseText>
      </AdminDetailsInformationRow>
      <AdminDetailsInformationRow v-if="viewedUser.reviewMessage" :label="reviewMessageLabel">
        <span class="whitespace-pre-line">{{ viewedUser.reviewMessage }}</span>
      </AdminDetailsInformationRow>
      <AdminDetailsInformationRow label="User ID">
        <span class="font-mono text-caption break-all text-neutral-600 dark:text-neutral-400">
          {{ viewedUser.id }}
        </span>
      </AdminDetailsInformationRow>
    </dl>
  </AdminDetailsSection>
</template>
