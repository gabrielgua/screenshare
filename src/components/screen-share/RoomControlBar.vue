<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseIconButton from '@/components/button/BaseIconButton.vue'
import { useAppFullscreen } from '@/composables/use-app-fullscreen'
import { canCaptureScreen } from '@/media/screen-capture'
import type { ScreenShareSettings } from '@/media/screen-share-quality'
import { useScreenShareStore } from '@/stores/screen-share-store'
import {
  ChangeSharedScreenIcon,
  EnterFullscreenIcon,
  ExitFullscreenIcon,
  ExitRoomIcon,
  HideOwnShareIcon,
  MuteEverythingIcon,
  ShareScreenIcon,
  ShowOwnShareIcon,
  SoundOnIcon,
  StopSharingIcon,
} from '@/theme/app-icons'
import ShareScreenDialog, { type ShareScreenDialogPurpose } from './ShareScreenDialog.vue'

const router = useRouter()
const screenShareStore = useScreenShareStore()
const { isFullscreen: isAppFullscreen, toggle: toggleAppFullscreen } = useAppFullscreen()

const canShareFromThisDevice = canCaptureScreen()
const isShareDialogOpen = ref(false)
const shareDialogPurpose = ref<ShareScreenDialogPurpose>('start')

const hasRemoteShares = computed(
  () => Object.keys(screenShareStore.remoteStreamsByUserId).length > 0,
)
const shareButtonLabel = computed(() =>
  screenShareStore.isSharingScreen ? 'Stop sharing' : 'Share your screen',
)

function openShareDialog(purpose: ShareScreenDialogPurpose) {
  shareDialogPurpose.value = purpose
  isShareDialogOpen.value = true
}

function handleShareButtonClick() {
  if (screenShareStore.isSharingScreen) {
    screenShareStore.stopSharing()
    return
  }
  openShareDialog('start')
}

function handleOwnShareVisibilityButtonClick() {
  screenShareStore.toggleOwnShareVisibility()
}

function handleChangeShareButtonClick() {
  openShareDialog('change')
}

async function handleSettingsConfirmed(settings: ScreenShareSettings) {
  await screenShareStore.startSharing(settings)
  if (!screenShareStore.captureErrorMessage) {
    isShareDialogOpen.value = false
  }
}

function handleMuteEverythingButtonClick() {
  if (screenShareStore.isEverythingMuted) {
    screenShareStore.unmuteEverything()
    return
  }
  screenShareStore.muteEverything()
}

function handleFullscreenButtonClick() {
  void toggleAppFullscreen()
}

function handleExitRoomButtonClick() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="flex shrink-0 items-center justify-center gap-2 sm:gap-3" aria-label="Room controls">
    <BaseIconButton
      :icon="screenShareStore.isEverythingMuted ? SoundOnIcon : MuteEverythingIcon"
      :accessible-label="screenShareStore.isEverythingMuted ? 'Unmute everyone' : 'Mute everyone'"
      variant="neutral"
      appearance="outlined"
      shape="circle"
      :is-pressed="screenShareStore.isEverythingMuted"
      :is-disabled="!hasRemoteShares"
      @click="handleMuteEverythingButtonClick"
    />
    <BaseIconButton
      v-if="canShareFromThisDevice"
      :icon="screenShareStore.isSharingScreen ? StopSharingIcon : ShareScreenIcon"
      :accessible-label="shareButtonLabel"
      :variant="screenShareStore.isSharingScreen ? 'danger' : 'primary'"
      size="lg"
      shape="circle"
      :is-loading="screenShareStore.isStartingShare"
      @click="handleShareButtonClick"
    />
    <BaseIconButton
      v-if="screenShareStore.isSharingScreen"
      :icon="ChangeSharedScreenIcon"
      accessible-label="Change what you share"
      variant="neutral"
      appearance="outlined"
      shape="circle"
      @click="handleChangeShareButtonClick"
    />
    <BaseIconButton
      v-if="screenShareStore.isSharingScreen"
      :icon="screenShareStore.isOwnShareHidden ? ShowOwnShareIcon : HideOwnShareIcon"
      :accessible-label="
        screenShareStore.isOwnShareHidden ? 'Show your screen' : 'Hide your screen for you only'
      "
      variant="neutral"
      appearance="outlined"
      shape="circle"
      :is-pressed="screenShareStore.isOwnShareHidden"
      @click="handleOwnShareVisibilityButtonClick"
    />
    <BaseIconButton
      :icon="isAppFullscreen ? ExitFullscreenIcon : EnterFullscreenIcon"
      :accessible-label="isAppFullscreen ? 'Exit full screen' : 'Full screen'"
      variant="neutral"
      appearance="outlined"
      shape="circle"
      @click="handleFullscreenButtonClick"
    />
    <BaseIconButton
      :icon="ExitRoomIcon"
      accessible-label="Leave the room"
      variant="danger"
      appearance="outlined"
      shape="circle"
      @click="handleExitRoomButtonClick"
    />

    <ShareScreenDialog
      v-model:open="isShareDialogOpen"
      :purpose="shareDialogPurpose"
      @settings-confirmed="handleSettingsConfirmed"
    />
  </div>
</template>
