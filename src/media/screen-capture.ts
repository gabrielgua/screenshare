import { readFrameSize, type ScreenShareSettings } from './screen-share-quality'

interface ScreenCaptureOptions extends DisplayMediaStreamOptions {
  selfBrowserSurface?: 'include' | 'exclude'
  surfaceSwitching?: 'include' | 'exclude'
  systemAudio?: 'include' | 'exclude'
}

export function canCaptureScreen(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getDisplayMedia)
}

export async function captureScreen(settings: ScreenShareSettings): Promise<MediaStream> {
  const { width, height } = readFrameSize(settings.resolution)
  const captureOptions: ScreenCaptureOptions = {
    video: {
      width: { ideal: width, max: width },
      height: { ideal: height, max: height },
      frameRate: { ideal: settings.frameRate, max: settings.frameRate },
    },
    audio: settings.shouldShareAudio
      ? { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      : false,
    selfBrowserSurface: 'exclude',
    surfaceSwitching: 'include',
    systemAudio: settings.shouldShareAudio ? 'include' : 'exclude',
  }
  const capturedStream = await navigator.mediaDevices.getDisplayMedia(captureOptions)
  const capturedVideoTrack = capturedStream.getVideoTracks()[0]
  if (capturedVideoTrack) {
    capturedVideoTrack.contentHint = settings.frameRate === 60 ? 'motion' : 'detail'
  }
  return capturedStream
}

export function stopStream(stream: MediaStream | undefined) {
  stream?.getTracks().forEach((track) => track.stop())
}
