<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/button/BaseButton.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { ArrowRightIcon, InviteLinkIcon } from '@/theme/app-icons'

const ROOM_ID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

const router = useRouter()

const roomLink = ref('')
const hasInvalidRoomLink = ref(false)

watch(roomLink, () => {
  hasInvalidRoomLink.value = false
})

function handleJoinSubmit() {
  const roomIdMatch = ROOM_ID_PATTERN.exec(roomLink.value)
  if (!roomIdMatch) {
    hasInvalidRoomLink.value = true
    return
  }
  router.push({ name: 'room', params: { roomId: roomIdMatch[0].toLowerCase() } })
}
</script>

<template>
  <form class="flex flex-col gap-2" novalidate @submit.prevent="handleJoinSubmit">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
      <BaseInput
        v-model="roomLink"
        label="Room link"
        placeholder="Paste a room link"
        autocomplete="off"
        :leading-icon="InviteLinkIcon"
        :status="hasInvalidRoomLink ? 'danger' : 'default'"
        class="min-w-0 flex-1"
      />
      <BaseButton
        type="submit"
        :trailing-icon="ArrowRightIcon"
        :is-disabled="roomLink.trim() === ''"
      >
        Join
      </BaseButton>
    </div>
    <BaseText v-if="hasInvalidRoomLink" size="caption" tone="danger" role="alert">
      That does not look like a room link. Ask your friend to copy it again.
    </BaseText>
  </form>
</template>
