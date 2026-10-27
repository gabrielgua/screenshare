import {
  createApplicationAudioTrack,
  releaseApplicationAudioTrack,
} from './application-audio-track'
import { readDesktopBridge } from './desktop-bridge'
import { isTouchOnlyDevice } from './device-capabilities'
import type { DesktopBridge } from './desktop-bridge-contract'
import { readFrameSize, type ScreenShareSettings } from './screen-share-quality'

interface ScreenAudioConstraints extends MediaTrackConstraints {
  restrictOwnAudio?: boolean
}

interface ScreenCaptureOptions extends DisplayMediaStreamOptions {
  audio?: boolean | ScreenAudioConstraints
  selfBrowserSurface?: 'include' | 'exclude'
  surfaceSwitching?: 'include' | 'exclude'
  systemAudio?: 'include' | 'exclude'
}

export function canCaptureScreen(): boolean {
  if (readDesktopBridge()) {
    return true
  }
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
    return false
  }
  return !isTouchOnlyDevice()
}

export async function captureScreen(
  settings: ScreenShareSettings,
  desktopSourceId?: string,
): Promise<MediaStream> {
  const desktopBridge = readDesktopBridge()
  if (desktopBridge && desktopSourceId) {
    return captureDesktopSource(desktopBridge, settings, desktopSourceId)
  }
  const captureOptions: ScreenCaptureOptions = {
    video: readVideoConstraints(settings),
    audio: settings.shouldShareAudio
      ? {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          restrictOwnAudio: true,
        }
      : false,
    selfBrowserSurface: 'exclude',
    surfaceSwitching: 'include',
    systemAudio: settings.shouldShareAudio ? 'include' : 'exclude',
  }
  const capturedStream = await navigator.mediaDevices.getDisplayMedia(captureOptions)
  applyContentHint(capturedStream, settings)
  return capturedStream
}

export function stopStream(stream: MediaStream | undefined) {
  stream?.getTracks().forEach((track) => {
    track.stop()
    releaseApplicationAudioTrack(track)
  })
}

async function captureDesktopSource(
  desktopBridge: DesktopBridge,
  settings: ScreenShareSettings,
  sourceId: string,
): Promise<MediaStream> {
  await desktopBridge.selectCaptureSource(sourceId)
  const capturedStream = await navigator.mediaDevices.getDisplayMedia({
    video: readVideoConstraints(settings),
    audio: false,
  })
  applyContentHint(capturedStream, settings)
  if (!settings.shouldShareAudio) {
    return capturedStream
  }
  try {
    capturedStream.addTrack(await createApplicationAudioTrack(desktopBridge, sourceId))
  } catch (audioError) {
    stopStream(capturedStream)
    throw audioError
  }
  return capturedStream
}

function readVideoConstraints(settings: ScreenShareSettings): MediaTrackConstraints {
  const { width, height } = readFrameSize(settings.resolution)
  return {
    width: { ideal: width, max: width },
    height: { ideal: height, max: height },
    frameRate: { ideal: settings.frameRate, max: settings.frameRate },
  }
}

function applyContentHint(capturedStream: MediaStream, settings: ScreenShareSettings) {
  const capturedVideoTrack = capturedStream.getVideoTracks()[0]
  if (capturedVideoTrack) {
    capturedVideoTrack.contentHint = settings.frameRate === 60 ? 'motion' : 'detail'
  }
}
