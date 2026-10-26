<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import DiscordSignInButton from '@/components/authentication/DiscordSignInButton.vue'
import LoadErrorRetry from '@/components/feedback/LoadErrorRetry.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageLoadingSpinner from '@/components/layout/PageLoadingSpinner.vue'
import PageTransition from '@/components/layout/PageTransition.vue'
import RoomCompactBar from '@/components/rooms/RoomCompactBar.vue'
import RoomInvitation from '@/components/rooms/RoomInvitation.vue'
import RoomSidebar from '@/components/rooms/RoomSidebar.vue'
import RoomUnavailableNotice from '@/components/rooms/RoomUnavailableNotice.vue'
import RoomScreenShareArea from '@/components/screen-share/RoomScreenShareArea.vue'
import { useRequestedRoomPresence } from '@/composables/use-requested-room-presence'
import { useRoomArrivalNotifications } from '@/composables/use-room-arrival-notifications'
import { useRoomKickRedirect } from '@/composables/use-room-kick-redirect'
import { useRoomScreenSharing } from '@/composables/use-room-screen-sharing'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useCurrentUserStore } from '@/stores/current-user-store'
import { useRoomStore } from '@/stores/room-store'
import { PendingIcon, RoomBlockedUserIcon, RoomIcon, SignInIcon } from '@/theme/app-icons'

type RoomPageScreen =
  | 'loading'
  | 'signed-out'
  | 'not-approved'
  | 'not-found'
  | 'load-error'
  | 'blocked'
  | 'invitation'
  | 'room'

const route = useRoute()
const authenticationStore = useAuthenticationStore()
const currentUserStore = useCurrentUserStore()
const roomStore = useRoomStore()

const requestedRoomId = computed(() => String(route.params.roomId))
const { presentUsers, presentUserIds } = useRequestedRoomPresence(() => roomStore.isRoomMember)
useRoomArrivalNotifications(
  presentUsers,
  () => roomStore.room?.id,
  () => roomStore.room?.name,
)
const { screenShares } = useRoomScreenSharing(presentUsers, () => roomStore.isRoomMember)
useRoomKickRedirect(
  () => roomStore.room?.id,
  () => roomStore.room?.name,
)

const visibleRoomPageScreen = computed<RoomPageScreen>(() => {
  if (authenticationStore.isRestoringSession) {
    return 'loading'
  }
  if (!authenticationStore.isSignedIn) {
    return 'signed-out'
  }
  if (!currentUserStore.hasResolvedCurrentUser) {
    return 'loading'
  }
  if (!currentUserStore.isApproved) {
    return 'not-approved'
  }
  return roomStore.visibleRoomScreen
})

watch(
  [requestedRoomId, () => currentUserStore.isApproved],
  ([roomId, isApproved]) => {
    if (isApproved) {
      roomStore.loadRoom(roomId)
    }
  },
  { immediate: true },
)

function handleRetryRequested() {
  roomStore.loadRoom(requestedRoomId.value)
}
</script>

<template>
  <PageContainer
    :width="visibleRoomPageScreen === 'room' ? 'full' : 'regular'"
    class="flex-1"
    :class="visibleRoomPageScreen === 'room' ? 'lg:min-h-0' : 'justify-center'"
  >
    <PageTransition>
      <PageLoadingSpinner
        v-if="visibleRoomPageScreen === 'loading'"
        accessible-label="Loading the room"
      />
      <RoomUnavailableNotice
        v-else-if="visibleRoomPageScreen === 'signed-out'"
        title="Sign in to join this room"
        description="Rooms are for approved members. Sign in with Discord and you will come right back here."
        :icon="SignInIcon"
      >
        <DiscordSignInButton />
      </RoomUnavailableNotice>
      <RoomUnavailableNotice
        v-else-if="visibleRoomPageScreen === 'not-approved'"
        title="Your account is not approved yet"
        description="Only approved members can join rooms. Check your account status on the home page."
        :icon="PendingIcon"
      />
      <RoomUnavailableNotice
        v-else-if="visibleRoomPageScreen === 'not-found'"
        title="This room does not exist"
        description="The link may be wrong, or the room was removed. Ask your friend for a new link."
        :icon="RoomIcon"
      />
      <RoomUnavailableNotice
        v-else-if="visibleRoomPageScreen === 'blocked'"
        title="You can't join this room"
        description="You were removed from this room. Ask the owner to unblock you if you think this was a mistake."
        :icon="RoomBlockedUserIcon"
      />
      <LoadErrorRetry
        v-else-if="visibleRoomPageScreen === 'load-error' && roomStore.loadErrorMessage"
        :error-message="roomStore.loadErrorMessage"
        @retry-requested="handleRetryRequested"
      />
      <RoomInvitation
        v-else-if="visibleRoomPageScreen === 'invitation' && roomStore.roomPreview"
        :room-preview="roomStore.roomPreview"
      />
      <div v-else-if="roomStore.room" class="flex flex-1 flex-col gap-4 lg:min-h-0 lg:flex-row">
        <RoomCompactBar
          :room="roomStore.room"
          :owner-name="roomStore.roomPreview?.ownerName"
          :present-users="presentUsers"
          :present-user-ids="presentUserIds"
        />
        <RoomScreenShareArea :screen-shares="screenShares" />
        <RoomSidebar
          :room="roomStore.room"
          :owner-name="roomStore.roomPreview?.ownerName"
          :present-users="presentUsers"
          :present-user-ids="presentUserIds"
        />
      </div>
    </PageTransition>
  </PageContainer>
</template>
