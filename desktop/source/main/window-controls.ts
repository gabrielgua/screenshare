import { nativeTheme, type BrowserWindow, type TitleBarOverlayOptions } from 'electron'
import type { DesktopColorScheme } from '../../../web/src/media/desktop-bridge-contract'

const WINDOW_CONTROLS_HEIGHT_MATCHING_APP_HEADER = 64

const windowControlsColorsByColorScheme: Record<DesktopColorScheme, TitleBarOverlayOptions> = {
  light: { color: '#f7f7f8', symbolColor: '#3f4148' },
  dark: { color: '#111214', symbolColor: '#d4d5d9' },
}

export function readInitialColorScheme(): DesktopColorScheme {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
}

export function describeWindowControls(colorScheme: DesktopColorScheme): TitleBarOverlayOptions {
  return {
    ...windowControlsColorsByColorScheme[colorScheme],
    height: WINDOW_CONTROLS_HEIGHT_MATCHING_APP_HEADER,
  }
}

export function applyWindowControlsColorScheme(
  window: BrowserWindow,
  colorScheme: DesktopColorScheme,
) {
  window.setTitleBarOverlay(describeWindowControls(colorScheme))
  window.setBackgroundColor(windowControlsColorsByColorScheme[colorScheme].color ?? '')
}

export function isDesktopColorScheme(colorScheme: unknown): colorScheme is DesktopColorScheme {
  return colorScheme === 'light' || colorScheme === 'dark'
}
