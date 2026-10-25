<script setup lang="ts">
import { computed } from 'vue'
import { useTimeAgo } from '@vueuse/core'
import AdminDetailsInformationRow from '@/components/admin/AdminDetailsInformationRow.vue'
import AdminDetailsSection from '@/components/admin/AdminDetailsSection.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { formatDateTime } from '@/formatting/date-time'
import { formatMemberCount } from '@/formatting/member-count'
import { buildRoomShareUrl, type Room } from '@/services/rooms-service'

interface RoomDetailsInformationProps {
  room: Room
  ownerName: string
  memberCount: number
  blockedUserCount: number
}

const props = defineProps<RoomDetailsInformationProps>()

const timeSinceCreation = useTimeAgo(() => props.room.createdAt)
const timeSinceLastUpdate = useTimeAgo(() => props.room.updatedAt)
const roomShareUrl = computed(() => buildRoomShareUrl(props.room.id))
</script>

<template>
  <AdminDetailsSection title="Information">
    <dl class="flex flex-col">
      <AdminDetailsInformationRow label="Owner">
        <RouterLink
          :to="{ name: 'admin-user-details', params: { userId: room.ownerId } }"
          class="font-medium text-brand-700 underline-offset-2 hover:underline dark:text-brand-300"
        >
          {{ ownerName }}
        </RouterLink>
      </AdminDetailsInformationRow>
      <AdminDetailsInformationRow label="Created">
        {{ formatDateTime(room.createdAt) }}
        <BaseText as="span" size="sm" tone="subtle">({{ timeSinceCreation }})</BaseText>
      </AdminDetailsInformationRow>
      <AdminDetailsInformationRow label="Last updated">
        {{ formatDateTime(room.updatedAt) }}
        <BaseText as="span" size="sm" tone="subtle">({{ timeSinceLastUpdate }})</BaseText>
      </AdminDetailsInformationRow>
      <AdminDetailsInformationRow label="Members">
        {{ formatMemberCount(memberCount) }}
      </AdminDetailsInformationRow>
      <AdminDetailsInformationRow label="Blocked">
        {{ blockedUserCount === 0 ? 'Nobody' : `${blockedUserCount} blocked` }}
      </AdminDetailsInformationRow>
      <AdminDetailsInformationRow label="Room link">
        <span class="break-all">{{ roomShareUrl }}</span>
      </AdminDetailsInformationRow>
      <AdminDetailsInformationRow label="Room ID">
        <span class="font-mono text-caption break-all text-neutral-600 dark:text-neutral-400">
          {{ room.id }}
        </span>
      </AdminDetailsInformationRow>
    </dl>
  </AdminDetailsSection>
</template>
