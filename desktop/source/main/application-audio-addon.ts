import { join } from 'node:path'

export type ApplicationAudioScope = 'include-process-tree' | 'exclude-process-tree'

export interface ApplicationAudioCaptureOptions {
  processId: number
  scope: ApplicationAudioScope
  onSamplesCaptured: (samples: Float32Array) => void
  onCaptureFailed: (failureDescription: string) => void
}

export interface ApplicationAudioCapture {
  start(): void
  stop(): void
}

interface ApplicationAudioAddon {
  ApplicationAudioCapture: new (options: ApplicationAudioCaptureOptions) => ApplicationAudioCapture
  findWindowProcessId(windowHandle: number): number
  capturedSampleRate: number
  capturedChannelCount: number
}

const ADDON_PATH = join(
  __dirname,
  '..',
  'native',
  'application-audio',
  'build',
  'Release',
  'application_audio.node',
)

let loadedAddon: ApplicationAudioAddon | undefined

export function loadApplicationAudioAddon(): ApplicationAudioAddon {
  loadedAddon ??= require(ADDON_PATH) as ApplicationAudioAddon
  return loadedAddon
}
