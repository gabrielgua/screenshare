import { app, session, type BrowserWindow } from 'electron'
import { updateElectronApp, UpdateSourceType } from 'update-electron-app'
import { handleDesktopBridgeRequests } from './desktop-bridge-handlers'
import { createMainWindow, grantAppPermissions } from './main-window'
import { handleDisplayMediaRequests } from './screen-capture-sources'

const APP_USER_MODEL_ID = 'com.squirrel.Screenshare.Screenshare'
const RELEASES_REPOSITORY = 'gabrielgua/screenshare'

const isHandlingInstallerEvent = require('electron-squirrel-startup') as boolean

let mainWindow: BrowserWindow | undefined

function focusMainWindow() {
  if (!mainWindow) {
    return
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }
  mainWindow.focus()
}

function startApp() {
  app.setAppUserModelId(APP_USER_MODEL_ID)
  if (app.isPackaged) {
    updateElectronApp({
      updateSource: {
        type: UpdateSourceType.ElectronPublicUpdateService,
        repo: RELEASES_REPOSITORY,
      },
    })
  }
  grantAppPermissions(session.defaultSession)
  handleDisplayMediaRequests(session.defaultSession)
  mainWindow = createMainWindow()
  handleDesktopBridgeRequests(mainWindow)
  mainWindow.on('closed', () => {
    mainWindow = undefined
  })
}

if (isHandlingInstallerEvent || !app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', focusMainWindow)
  app.on('window-all-closed', () => app.quit())
  void app.whenReady().then(startApp)
}
