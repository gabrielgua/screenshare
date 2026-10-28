import type { BrowserWindowConstructorOptions, HandlerDetails } from 'electron'
import { MINIPLAYER_WINDOW_NAME } from '../../../web/src/media/desktop-bridge-contract'
import { describeWindowControls, readInitialColorScheme } from './window-controls'

const BLANK_PAGE_ADDRESS = 'about:blank'
const MINIPLAYER_MINIMUM_WIDTH = 240
const MINIPLAYER_MINIMUM_HEIGHT = 160

export function isMiniplayerWindowRequest(openDetails: HandlerDetails): boolean {
  return openDetails.frameName === MINIPLAYER_WINDOW_NAME && openDetails.url === BLANK_PAGE_ADDRESS
}

export function describeMiniplayerWindow(): BrowserWindowConstructorOptions {
  return {
    title: 'Screenshare miniplayer',
    alwaysOnTop: true,
    autoHideMenuBar: true,
    minimizable: false,
    fullscreenable: false,
    minWidth: MINIPLAYER_MINIMUM_WIDTH,
    minHeight: MINIPLAYER_MINIMUM_HEIGHT,
    backgroundColor: describeWindowControls(readInitialColorScheme()).color,
  }
}
