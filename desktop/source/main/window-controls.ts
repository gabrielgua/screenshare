import { nativeTheme, type BrowserWindow, type TitleBarOverlayOptions } from 'electron'
import type { DesktopColorScheme } from '../../../web/src/media/desktop-bridge-contract'

export const WINDOW_CONTROLS_HEIGHT_MATCHING_APP_HEADER = 64
export const WINDOW_CONTROLS_HEIGHT_MATCHING_MINIPLAYER_HEADER = 32

const windowControlsColorsByColorScheme: Record<DesktopColorScheme, TitleBarOverlayOptions> = {
  light: { color: '#f7f7f8', symbolColor: '#3f4148' },
  dark: { color: '#111214', symbolColor: '#d4d5d9' },
}

let chosenColorScheme: DesktopColorScheme | undefined

export function readCurrentColorScheme(): DesktopColorScheme {
  return chosenColorScheme ?? (nativeTheme.shouldUseDarkColors ? 'dark' : 'light')
}

export function rememberColorScheme(colorScheme: DesktopColorScheme) {
  chosenColorScheme = colorScheme
}

export function describeWindowControls(
  colorScheme: DesktopColorScheme,
  controlsHeight: number,
): TitleBarOverlayOptions {
  return { ...windowControlsColorsByColorScheme[colorScheme], height: controlsHeight }
}

export function applyWindowControlsColorScheme(
  window: BrowserWindow,
  colorScheme: DesktopColorScheme,
  controlsHeight: number,
) {
  window.setTitleBarOverlay(describeWindowControls(colorScheme, controlsHeight))
  window.setBackgroundColor(windowControlsColorsByColorScheme[colorScheme].color ?? '')
}

export function isDesktopColorScheme(colorScheme: unknown): colorScheme is DesktopColorScheme {
  return colorScheme === 'light' || colorScheme === 'dark'
}
