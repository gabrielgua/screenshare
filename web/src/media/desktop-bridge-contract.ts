export type DesktopCaptureSourceKind = 'screen' | 'window'

export type DesktopColorScheme = 'light' | 'dark'

export interface DesktopCaptureSource {
  id: string
  name: string
  kind: DesktopCaptureSourceKind
  thumbnailDataUrl: string
  appIconDataUrl?: string
}

export interface StartedApplicationAudio {
  captureId: number
  sampleRate: number
  channelCount: number
}

export interface DesktopBridge {
  listCaptureSources(): Promise<DesktopCaptureSource[]>
  selectCaptureSource(sourceId: string): Promise<void>
  startApplicationAudio(sourceId: string): Promise<StartedApplicationAudio>
  stopApplicationAudio(captureId: number): Promise<void>
  setWindowControlsColorScheme?(colorScheme: DesktopColorScheme): Promise<void>
}

export const DESKTOP_BRIDGE_GLOBAL_NAME = 'screenshareDesktop'

export const MINIPLAYER_WINDOW_NAME = 'screenshare-miniplayer'

export const APPLICATION_AUDIO_PORT_MESSAGE_TYPE = 'screenshare-application-audio-port'
