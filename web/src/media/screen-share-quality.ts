export type ScreenShareResolution = '480p' | '720p' | '1080p'

export type ScreenShareFrameRate = 30 | 60

export type RemoteViewQuality = 'full' | 'thumbnail'

export interface ScreenShareSettings {
  resolution: ScreenShareResolution
  frameRate: ScreenShareFrameRate
  shouldShareAudio: boolean
}

export interface FrameSize {
  width: number
  height: number
}

export const AVAILABLE_SCREEN_SHARE_RESOLUTIONS: ScreenShareResolution[] = ['480p', '720p', '1080p']

export const AVAILABLE_SCREEN_SHARE_FRAME_RATES: ScreenShareFrameRate[] = [30, 60]

export const THUMBNAIL_FRAME_WIDTH = 320

export const THUMBNAIL_MAXIMUM_BITRATE = 300_000

export const THUMBNAIL_MAXIMUM_FRAME_RATE = 15

export const THUMBNAIL_TILE_WIDTH_LIMIT = 420

const frameSizeByResolution: Record<ScreenShareResolution, FrameSize> = {
  '480p': { width: 854, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
}

const maximumBitrateByResolution: Record<
  ScreenShareResolution,
  Record<ScreenShareFrameRate, number>
> = {
  '480p': { 30: 1_000_000, 60: 1_500_000 },
  '720p': { 30: 2_500_000, 60: 4_000_000 },
  '1080p': { 30: 4_500_000, 60: 7_000_000 },
}

export function readFrameSize(resolution: ScreenShareResolution): FrameSize {
  return frameSizeByResolution[resolution]
}

export function readMaximumBitrate(
  resolution: ScreenShareResolution,
  frameRate: ScreenShareFrameRate,
): number {
  return maximumBitrateByResolution[resolution][frameRate]
}
