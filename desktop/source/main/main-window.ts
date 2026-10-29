import { join } from 'node:path'
import { BrowserWindow, shell, type Session } from 'electron'
import { MINIPLAYER_WINDOW_MOVE_CHANNEL } from '../shared/desktop-ipc-channels'
import { APP_ADDRESS, canOpenInBrowser, canOpenInsideApp, isAppAddress } from './app-address'
import { stopApplicationAudio } from './application-audio-sharing'
import {
  describeDragGhostWindow,
  describeMiniplayerWindow,
  isDragGhostWindowRequest,
  isMiniplayerWindowRequest,
  prepareChildWindow,
} from './miniplayer-window'
import {
  describeWindowControls,
  readCurrentColorScheme,
  WINDOW_CONTROLS_HEIGHT_MATCHING_APP_HEADER,
} from './window-controls'

const ALLOWED_APP_PERMISSIONS = new Set([
  'media',
  'display-capture',
  'fullscreen',
  'clipboard-sanitized-write',
])

const WINDOW_ICON_PATH = join(__dirname, '..', 'assets', 'screenshare.ico')

export function createMainWindow(): BrowserWindow {
  const initialWindowControls = describeWindowControls(
    readCurrentColorScheme(),
    WINDOW_CONTROLS_HEIGHT_MATCHING_APP_HEADER,
  )
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 400,
    minHeight: 500,
    title: 'Screenshare',
    icon: WINDOW_ICON_PATH,
    backgroundColor: initialWindowControls.color,
    titleBarStyle: 'hidden',
    titleBarOverlay: initialWindowControls,
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())
  keepNavigationInsideTrustedPages(mainWindow)
  mainWindow.webContents.on('did-start-navigation', (navigationDetails) => {
    if (navigationDetails.isMainFrame && !navigationDetails.isSameDocument) {
      stopApplicationAudio()
    }
  })
  mainWindow.webContents.on('render-process-gone', () => stopApplicationAudio())
  mainWindow.on('closed', () => stopApplicationAudio())

  void mainWindow.loadURL(APP_ADDRESS.href)
  return mainWindow
}

export function grantAppPermissions(session: Session) {
  session.setPermissionRequestHandler((_contents, permission, grantPermission, details) => {
    grantPermission(ALLOWED_APP_PERMISSIONS.has(permission) && isAppAddress(details.requestingUrl))
  })
  session.setPermissionCheckHandler(
    (_contents, permission, requestingOrigin) =>
      ALLOWED_APP_PERMISSIONS.has(permission) && isAppAddress(requestingOrigin),
  )
}

function keepNavigationInsideTrustedPages(mainWindow: BrowserWindow) {
  mainWindow.webContents.setWindowOpenHandler((openDetails) => {
    if (isDragGhostWindowRequest(openDetails)) {
      return { action: 'allow', overrideBrowserWindowOptions: describeDragGhostWindow() }
    }
    if (isMiniplayerWindowRequest(openDetails)) {
      return { action: 'allow', overrideBrowserWindowOptions: describeMiniplayerWindow() }
    }
    if (canOpenInBrowser(openDetails.url)) {
      void shell.openExternal(openDetails.url)
    }
    return { action: 'deny' }
  })
  mainWindow.webContents.on('did-create-window', (childWindow, creationDetails) =>
    prepareChildWindow(childWindow, creationDetails.frameName, (windowMove) => {
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send(MINIPLAYER_WINDOW_MOVE_CHANNEL, windowMove)
      }
    }),
  )
  mainWindow.webContents.on('will-navigate', (navigationEvent) => {
    if (canOpenInsideApp(navigationEvent.url)) {
      return
    }
    navigationEvent.preventDefault()
    if (canOpenInBrowser(navigationEvent.url)) {
      void shell.openExternal(navigationEvent.url)
    }
  })
}
