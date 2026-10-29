import type { DesktopCaptureSource } from './desktop-bridge-contract'

export type SharedSurfaceKind = 'screen' | 'window' | 'tab'

export interface SharedSurface {
  kind: SharedSurfaceKind
  name?: string
}

const MAXIMUM_SURFACE_NAME_LENGTH = 80
const SHARED_SURFACE_KINDS: SharedSurfaceKind[] = ['screen', 'window', 'tab']

const surfaceKindByDisplaySurface: Record<string, SharedSurfaceKind> = {
  monitor: 'screen',
  window: 'window',
  browser: 'tab',
}

const unnamedSurfaceByKind: Record<SharedSurfaceKind, string> = {
  screen: 'a screen',
  window: 'a window',
  tab: 'a tab',
}

export function describeCapturedSurface(
  capturedStream: MediaStream,
  desktopSource?: DesktopCaptureSource,
): SharedSurface | undefined {
  if (desktopSource) {
    return desktopSource.kind === 'screen'
      ? { kind: 'screen' }
      : { kind: 'window', name: desktopSource.name }
  }
  const displaySurface = capturedStream.getVideoTracks()[0]?.getSettings().displaySurface
  const kind = displaySurface ? surfaceKindByDisplaySurface[displaySurface] : undefined
  return kind ? { kind } : undefined
}

function isSharedSurfaceKind(kind: unknown): kind is SharedSurfaceKind {
  return SHARED_SURFACE_KINDS.some((surfaceKind) => surfaceKind === kind)
}

export function readSharedSurface(untrustedSurface: unknown): SharedSurface | undefined {
  if (typeof untrustedSurface !== 'object' || untrustedSurface === null) {
    return undefined
  }
  const kind: unknown = Reflect.get(untrustedSurface, 'kind')
  const name: unknown = Reflect.get(untrustedSurface, 'name')
  if (!isSharedSurfaceKind(kind)) {
    return undefined
  }
  const trimmedName = typeof name === 'string' ? name.trim() : ''
  return trimmedName ? { kind, name: trimmedName.slice(0, MAXIMUM_SURFACE_NAME_LENGTH) } : { kind }
}

export function describeShareTitle(
  sharerName: string,
  isOwnShare: boolean,
  sharedSurface: SharedSurface | undefined,
): string {
  const sharer = isOwnShare ? 'You are' : `${sharerName} is`
  if (!sharedSurface) {
    return `${sharer} sharing`
  }
  if (sharedSurface.kind === 'screen') {
    return `${sharer} sharing ${isOwnShare ? 'your' : 'their'} screen`
  }
  return `${sharer} sharing ${sharedSurface.name ?? unnamedSurfaceByKind[sharedSurface.kind]}`
}
