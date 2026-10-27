import { ipcMain, type BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import {
  LIST_CAPTURE_SOURCES_CHANNEL,
  SELECT_CAPTURE_SOURCE_CHANNEL,
  SET_WINDOW_CONTROLS_COLOR_SCHEME_CHANNEL,
  START_APPLICATION_AUDIO_CHANNEL,
  STOP_APPLICATION_AUDIO_CHANNEL,
} from '../shared/desktop-ipc-channels'
import { isAppAddress } from './app-address'
import { startApplicationAudio, stopApplicationAudio } from './application-audio-sharing'
import { listCaptureSources, selectCaptureSource } from './screen-capture-sources'
import { applyWindowControlsColorScheme, isDesktopColorScheme } from './window-controls'

export function handleDesktopBridgeRequests(mainWindow: BrowserWindow) {
  ipcMain.handle(LIST_CAPTURE_SOURCES_CHANNEL, (invokeEvent) => {
    ensureRequestComesFromApp(invokeEvent)
    return listCaptureSources([mainWindow.getMediaSourceId()])
  })
  ipcMain.handle(SELECT_CAPTURE_SOURCE_CHANNEL, (invokeEvent, sourceId: unknown) => {
    ensureRequestComesFromApp(invokeEvent)
    selectCaptureSource(readSourceId(sourceId))
  })
  ipcMain.handle(START_APPLICATION_AUDIO_CHANNEL, (invokeEvent, sourceId: unknown) => {
    ensureRequestComesFromApp(invokeEvent)
    return startApplicationAudio(readSourceId(sourceId), invokeEvent.sender)
  })
  ipcMain.handle(STOP_APPLICATION_AUDIO_CHANNEL, (invokeEvent, captureId: unknown) => {
    ensureRequestComesFromApp(invokeEvent)
    if (typeof captureId === 'number') {
      stopApplicationAudio(captureId)
    }
  })
  ipcMain.handle(SET_WINDOW_CONTROLS_COLOR_SCHEME_CHANNEL, (invokeEvent, colorScheme: unknown) => {
    ensureRequestComesFromApp(invokeEvent)
    if (isDesktopColorScheme(colorScheme)) {
      applyWindowControlsColorScheme(mainWindow, colorScheme)
    }
  })
}

function ensureRequestComesFromApp(invokeEvent: IpcMainInvokeEvent) {
  const requestingAddress = invokeEvent.senderFrame?.url ?? ''
  if (!isAppAddress(requestingAddress)) {
    throw new Error('Only Screenshare can use the desktop features')
  }
}

function readSourceId(sourceId: unknown): string {
  if (typeof sourceId !== 'string') {
    throw new Error('A screen or window id is required')
  }
  return sourceId
}
