import { join } from 'node:path'
import { BrowserWindow, shell, type Session } from 'electron'
import { APP_ADDRESS, canOpenInBrowser, canOpenInsideApp, isAppAddress } from './app-address'
import { stopApplicationAudio } from './application-audio-sharing'
import { describeWindowControls, readInitialColorScheme } from './window-controls'

const ALLOWED_APP_PERMISSIONS = new Set([
  'media',
  'display-capture',
  'fullscreen',
  'clipboard-sanitized-write',
])

const WINDOW_ICON_PATH = join(__dirname, '..', 'assets', 'screenshare.ico')

export function createMainWindow(): BrowserWindow {
  const initialWindowControls = describeWindowControls(readInitialColorScheme())
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
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (canOpenInBrowser(url)) {
      void shell.openExternal(url)
    }
    return { action: 'deny' }
  })
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
