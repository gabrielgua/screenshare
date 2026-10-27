import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { RoomPeerMesh } from '@/media/room-peer-mesh'
import { captureScreen, stopStream } from '@/media/screen-capture'
import type { RemoteViewQuality, ScreenShareSettings } from '@/media/screen-share-quality'
import { describeError } from '@/services/describe-error'
import {
  openRoomSignalingChannel,
  type RoomSignalingConnection,
} from '@/services/room-signaling-service'

export type ScreenShareLayout = 'grid' | 'focus'

export interface ScreenShareAudio {
  volume: number
  isMuted: boolean
}

const INITIAL_SCREEN_SHARE_SETTINGS: ScreenShareSettings = {
  resolution: '1080p',
  frameRate: 30,
  shouldShareAudio: true,
}

const INITIAL_SCREEN_SHARE_AUDIO: ScreenShareAudio = { volume: 1, isMuted: false }

export const useScreenShareStore = defineStore('screen-share', () => {
  const shareSettings = useLocalStorage<ScreenShareSettings>(
    'screenshare-share-settings',
    INITIAL_SCREEN_SHARE_SETTINGS,
    { mergeDefaults: true },
  )
  const localStream = shallowRef<MediaStream>()
  const remoteStreamsByUserId = shallowRef<Record<string, MediaStream>>({})
  const audioByUserId = ref<Record<string, ScreenShareAudio>>({})
  const layout = ref<ScreenShareLayout>('grid')
  const focusedUserId = ref<string>()
  const connectedRoomId = ref<string>()
  const isStartingShare = ref(false)
  const captureErrorMessage = ref<string>()

  let peerMesh: RoomPeerMesh | undefined
  let signalingConnection: RoomSignalingConnection | undefined
  let latestPresentUserIds: string[] = []
  const sentViewQualityByUserId = new Map<string, RemoteViewQuality>()

  const isOwnShareHidden = ref(false)
  const isSharingScreen = computed(() => localStream.value !== undefined)
  const isSharingAudio = computed(() => (localStream.value?.getAudioTracks().length ?? 0) > 0)
  const isEverythingMuted = computed(() => {
    const remoteUserIds = Object.keys(remoteStreamsByUserId.value)
    return remoteUserIds.length > 0 && remoteUserIds.every((userId) => readAudio(userId).isMuted)
  })

  function readAudio(userId: string): ScreenShareAudio {
    return audioByUserId.value[userId] ?? INITIAL_SCREEN_SHARE_AUDIO
  }

  function updateAudio(userId: string, audioChanges: Partial<ScreenShareAudio>) {
    audioByUserId.value = {
      ...audioByUserId.value,
      [userId]: { ...readAudio(userId), ...audioChanges },
    }
  }

  function updateRemoteStream(userId: string, stream: MediaStream | undefined) {
    const nextRemoteStreams = { ...remoteStreamsByUserId.value }
    if (stream) {
      nextRemoteStreams[userId] = stream
    } else {
      delete nextRemoteStreams[userId]
      sentViewQualityByUserId.delete(userId)
      if (focusedUserId.value === userId) {
        focusedUserId.value = undefined
      }
    }
    remoteStreamsByUserId.value = nextRemoteStreams
  }

  async function connectToRoom(roomId: string, currentUserId: string) {
    if (connectedRoomId.value === roomId) {
      return
    }
    disconnectFromRoom()
    connectedRoomId.value = roomId
    const mesh = new RoomPeerMesh({
      currentUserId,
      sendMessage: (message) => signalingConnection?.sendMessage(message),
      onRemoteStreamChange: updateRemoteStream,
    })
    peerMesh = mesh
    const connection = await openRoomSignalingChannel(roomId, (message) =>
      mesh.handleMessage(message),
    )
    if (peerMesh !== mesh) {
      connection.close()
      return
    }
    signalingConnection = connection
    mesh.syncPresentUsers(latestPresentUserIds)
  }

  function syncPresentUsers(presentUserIds: string[]) {
    latestPresentUserIds = presentUserIds
    if (signalingConnection) {
      peerMesh?.syncPresentUsers(presentUserIds)
    }
  }

  function disconnectFromRoom() {
    stopSharing()
    peerMesh?.close()
    peerMesh = undefined
    signalingConnection?.close()
    signalingConnection = undefined
    connectedRoomId.value = undefined
    remoteStreamsByUserId.value = {}
    focusedUserId.value = undefined
    sentViewQualityByUserId.clear()
    latestPresentUserIds = []
  }

  async function startSharing(settings: ScreenShareSettings, desktopSourceId?: string) {
    isStartingShare.value = true
    captureErrorMessage.value = undefined
    try {
      const capturedStream = await captureScreen(settings, desktopSourceId)
      const previousStream = localStream.value
      shareSettings.value = settings
      localStream.value = capturedStream
      capturedStream.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (localStream.value === capturedStream) {
          stopSharing()
        }
      })
      peerMesh?.setLocalShare({ stream: capturedStream, settings })
      stopStream(previousStream)
    } catch (captureError) {
      if (!(captureError instanceof DOMException && captureError.name === 'NotAllowedError')) {
        captureErrorMessage.value = describeError(captureError, 'Could not share your screen')
      }
    } finally {
      isStartingShare.value = false
    }
  }

  function stopSharing() {
    if (!localStream.value) {
      return
    }
    peerMesh?.setLocalShare(undefined)
    stopStream(localStream.value)
    localStream.value = undefined
    isOwnShareHidden.value = false
  }

  function toggleOwnShareVisibility() {
    isOwnShareHidden.value = !isOwnShareHidden.value
  }

  function setVolume(userId: string, volume: number) {
    updateAudio(userId, { volume, isMuted: false })
  }

  function toggleMuted(userId: string) {
    updateAudio(userId, { isMuted: !readAudio(userId).isMuted })
  }

  function muteEverything() {
    Object.keys(remoteStreamsByUserId.value).forEach((userId) =>
      updateAudio(userId, { isMuted: true }),
    )
  }

  function unmuteEverything() {
    Object.keys(remoteStreamsByUserId.value).forEach((userId) =>
      updateAudio(userId, { isMuted: false }),
    )
  }

  function focusShare(userId: string) {
    focusedUserId.value = userId
    layout.value = 'focus'
  }

  function showSharesSideBySide() {
    layout.value = 'grid'
  }

  function requestRemoteViewQuality(userId: string, viewQuality: RemoteViewQuality) {
    if (sentViewQualityByUserId.get(userId) === viewQuality) {
      return
    }
    sentViewQualityByUserId.set(userId, viewQuality)
    peerMesh?.sendViewPreference(userId, viewQuality)
  }

  return {
    shareSettings,
    localStream,
    remoteStreamsByUserId,
    layout,
    focusedUserId,
    isStartingShare,
    captureErrorMessage,
    isSharingScreen,
    isEverythingMuted,
    readAudio,
    connectToRoom,
    syncPresentUsers,
    disconnectFromRoom,
    startSharing,
    stopSharing,
    isOwnShareHidden,
    isSharingAudio,
    toggleOwnShareVisibility,
    setVolume,
    toggleMuted,
    muteEverything,
    unmuteEverything,
    focusShare,
    showSharesSideBySide,
    requestRemoteViewQuality,
  }
})
