import { ipcMain, type BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import {
  LIST_CAPTURE_SOURCES_CHANNEL,
  MOVE_MINIPLAYER_WINDOW_BY_CHANNEL,
  SELECT_CAPTURE_SOURCE_CHANNEL,
  SET_WINDOW_CONTROLS_COLOR_SCHEME_CHANNEL,
  START_APPLICATION_AUDIO_CHANNEL,
  STOP_APPLICATION_AUDIO_CHANNEL,
} from '../shared/desktop-ipc-channels'
import type { DesktopWindowOffset } from '../../../web/src/media/desktop-bridge-contract'
import { isAppAddress } from './app-address'
import { startApplicationAudio, stopApplicationAudio } from './application-audio-sharing'
import { listCaptureSources, selectCaptureSource } from './screen-capture-sources'
import { listMiniplayerWindows, moveMiniplayerWindowBy } from './miniplayer-window'
import {
  applyWindowControlsColorScheme,
  isDesktopColorScheme,
  rememberColorScheme,
  WINDOW_CONTROLS_HEIGHT_MATCHING_APP_HEADER,
  WINDOW_CONTROLS_HEIGHT_MATCHING_MINIPLAYER_HEADER,
} from './window-controls'

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
  ipcMain.handle(
    MOVE_MINIPLAYER_WINDOW_BY_CHANNEL,
    (invokeEvent, windowName: unknown, offset: unknown) => {
      ensureRequestComesFromApp(invokeEvent)
      if (typeof windowName === 'string' && isWindowOffset(offset)) {
        moveMiniplayerWindowBy(windowName, offset)
      }
    },
  )
  ipcMain.handle(SET_WINDOW_CONTROLS_COLOR_SCHEME_CHANNEL, (invokeEvent, colorScheme: unknown) => {
    ensureRequestComesFromApp(invokeEvent)
    if (isDesktopColorScheme(colorScheme)) {
      rememberColorScheme(colorScheme)
      applyWindowControlsColorScheme(
        mainWindow,
        colorScheme,
        WINDOW_CONTROLS_HEIGHT_MATCHING_APP_HEADER,
      )
      for (const miniplayerWindow of listMiniplayerWindows()) {
        applyWindowControlsColorScheme(
          miniplayerWindow,
          colorScheme,
          WINDOW_CONTROLS_HEIGHT_MATCHING_MINIPLAYER_HEADER,
        )
      }
    }
  })
}

function isWindowOffset(offset: unknown): offset is DesktopWindowOffset {
  return (
    typeof offset === 'object' &&
    offset !== null &&
    Number.isFinite(Reflect.get(offset, 'x')) &&
    Number.isFinite(Reflect.get(offset, 'y'))
  )
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
