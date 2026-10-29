import type { BrowserWindow, BrowserWindowConstructorOptions, HandlerDetails } from 'electron'
import {
  DRAG_GHOST_WINDOW_NAME,
  MINIPLAYER_WINDOW_NAME,
  type DesktopWindowOffset,
  type MiniplayerWindowMove,
} from '../../../web/src/media/desktop-bridge-contract'
import {
  describeWindowControls,
  readCurrentColorScheme,
  WINDOW_CONTROLS_HEIGHT_MATCHING_MINIPLAYER_HEADER,
} from './window-controls'

const BLANK_PAGE_ADDRESS = 'about:blank'
const MINIPLAYER_MINIMUM_WIDTH = 240
const MINIPLAYER_MINIMUM_HEIGHT = 160

const openMiniplayerWindowsByName = new Map<string, BrowserWindow>()

function isMiniplayerName(frameName: string): boolean {
  return frameName === MINIPLAYER_WINDOW_NAME || frameName.startsWith(`${MINIPLAYER_WINDOW_NAME}-`)
}

export function isMiniplayerWindowRequest(openDetails: HandlerDetails): boolean {
  return isMiniplayerName(openDetails.frameName) && openDetails.url === BLANK_PAGE_ADDRESS
}

export function isDragGhostWindowRequest(openDetails: HandlerDetails): boolean {
  return openDetails.frameName === DRAG_GHOST_WINDOW_NAME && openDetails.url === BLANK_PAGE_ADDRESS
}

export function describeMiniplayerWindow(): BrowserWindowConstructorOptions {
  const windowControls = describeWindowControls(
    readCurrentColorScheme(),
    WINDOW_CONTROLS_HEIGHT_MATCHING_MINIPLAYER_HEADER,
  )
  return {
    title: 'Screenshare miniplayer',
    alwaysOnTop: true,
    autoHideMenuBar: true,
    fullscreenable: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: windowControls,
    minWidth: MINIPLAYER_MINIMUM_WIDTH,
    minHeight: MINIPLAYER_MINIMUM_HEIGHT,
    backgroundColor: windowControls.color,
  }
}

export function describeDragGhostWindow(): BrowserWindowConstructorOptions {
  return {
    frame: false,
    transparent: true,
    show: false,
    focusable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
  }
}

export function prepareChildWindow(
  childWindow: BrowserWindow,
  frameName: string,
  reportWindowMove: (windowMove: MiniplayerWindowMove) => void,
) {
  if (frameName === DRAG_GHOST_WINDOW_NAME) {
    childWindow.setIgnoreMouseEvents(true)
    childWindow.setAlwaysOnTop(true, 'screen-saver')
    childWindow.showInactive()
    return
  }
  if (isMiniplayerName(frameName)) {
    openMiniplayerWindowsByName.set(frameName, childWindow)
    childWindow.once('closed', () => {
      if (openMiniplayerWindowsByName.get(frameName) === childWindow) {
        openMiniplayerWindowsByName.delete(frameName)
      }
    })
    childWindow.on('will-move', (_moveEvent, newBounds) =>
      reportWindowMove({ windowName: frameName, bounds: newBounds, hasFinished: false }),
    )
    childWindow.on('moved', () =>
      reportWindowMove({
        windowName: frameName,
        bounds: childWindow.getBounds(),
        hasFinished: true,
      }),
    )
  }
}

export function listMiniplayerWindows(): BrowserWindow[] {
  return [...openMiniplayerWindowsByName.values()].filter(
    (miniplayerWindow) => !miniplayerWindow.isDestroyed(),
  )
}

export function moveMiniplayerWindowBy(windowName: string, offset: DesktopWindowOffset) {
  const miniplayerWindow = openMiniplayerWindowsByName.get(windowName)
  if (!miniplayerWindow || miniplayerWindow.isDestroyed()) {
    return
  }
  const [currentLeft = 0, currentTop = 0] = miniplayerWindow.getPosition()
  miniplayerWindow.setPosition(Math.round(currentLeft + offset.x), Math.round(currentTop + offset.y))
}
