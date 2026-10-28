import { contextBridge, ipcRenderer } from 'electron'
import {
  APPLICATION_AUDIO_PORT_MESSAGE_TYPE,
  DESKTOP_BRIDGE_GLOBAL_NAME,
  type DesktopBridge,
  type DesktopColorScheme,
  type DesktopCaptureSource,
  type DesktopWindowOffset,
  type MiniplayerWindowMove,
  type StartedApplicationAudio,
} from '../../../web/src/media/desktop-bridge-contract'
import {
  APPLICATION_AUDIO_PORT_CHANNEL,
  LIST_CAPTURE_SOURCES_CHANNEL,
  MINIPLAYER_WINDOW_MOVE_CHANNEL,
  MOVE_MINIPLAYER_WINDOW_BY_CHANNEL,
  SELECT_CAPTURE_SOURCE_CHANNEL,
  SET_WINDOW_CONTROLS_COLOR_SCHEME_CHANNEL,
  START_APPLICATION_AUDIO_CHANNEL,
  STOP_APPLICATION_AUDIO_CHANNEL,
} from '../shared/desktop-ipc-channels'

ipcRenderer.on(APPLICATION_AUDIO_PORT_CHANNEL, (portEvent, portDetails: { captureId: number }) => {
  window.postMessage(
    { type: APPLICATION_AUDIO_PORT_MESSAGE_TYPE, captureId: portDetails.captureId },
    window.location.origin,
    [...portEvent.ports],
  )
})

const desktopBridge: DesktopBridge = {
  listCaptureSources: (): Promise<DesktopCaptureSource[]> =>
    ipcRenderer.invoke(LIST_CAPTURE_SOURCES_CHANNEL),
  selectCaptureSource: (sourceId: string): Promise<void> =>
    ipcRenderer.invoke(SELECT_CAPTURE_SOURCE_CHANNEL, sourceId),
  startApplicationAudio: (sourceId: string): Promise<StartedApplicationAudio> =>
    ipcRenderer.invoke(START_APPLICATION_AUDIO_CHANNEL, sourceId),
  stopApplicationAudio: (captureId: number): Promise<void> =>
    ipcRenderer.invoke(STOP_APPLICATION_AUDIO_CHANNEL, captureId),
  setWindowControlsColorScheme: (colorScheme: DesktopColorScheme): Promise<void> =>
    ipcRenderer.invoke(SET_WINDOW_CONTROLS_COLOR_SCHEME_CHANNEL, colorScheme),
  canOpenSeparateMiniplayers: true,
  moveMiniplayerWindowBy: (windowName: string, offset: DesktopWindowOffset): Promise<void> =>
    ipcRenderer.invoke(MOVE_MINIPLAYER_WINDOW_BY_CHANNEL, windowName, offset),
  onMiniplayerWindowMove: (listener: (windowMove: MiniplayerWindowMove) => void) => {
    const handleWindowMove = (_moveEvent: unknown, windowMove: MiniplayerWindowMove) =>
      listener(windowMove)
    ipcRenderer.on(MINIPLAYER_WINDOW_MOVE_CHANNEL, handleWindowMove)
    return () => {
      ipcRenderer.removeListener(MINIPLAYER_WINDOW_MOVE_CHANNEL, handleWindowMove)
    }
  },
}

contextBridge.exposeInMainWorld(DESKTOP_BRIDGE_GLOBAL_NAME, desktopBridge)
