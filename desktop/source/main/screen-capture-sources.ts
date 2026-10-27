import { desktopCapturer, type DesktopCapturerSource, type Session } from 'electron'
import type {
  DesktopCaptureSource,
  DesktopCaptureSourceKind,
} from '../../../web/src/media/desktop-bridge-contract'

const SOURCE_THUMBNAIL_SIZE = { width: 480, height: 270 }

const WINDOW_SOURCE_ID_PATTERN = /^window:(\d+):/

let listedSourcesById = new Map<string, DesktopCapturerSource>()
let selectedSourceId: string | undefined

export async function listCaptureSources(
  excludedSourceIds: string[],
): Promise<DesktopCaptureSource[]> {
  const capturerSources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
    thumbnailSize: SOURCE_THUMBNAIL_SIZE,
    fetchWindowIcons: true,
  })
  const shareableSources = capturerSources.filter(
    (capturerSource) =>
      !excludedSourceIds.includes(capturerSource.id) && !capturerSource.thumbnail.isEmpty(),
  )
  listedSourcesById = new Map(
    shareableSources.map((capturerSource) => [capturerSource.id, capturerSource]),
  )
  return shareableSources.map(describeCaptureSource)
}

export function selectCaptureSource(sourceId: string) {
  if (!listedSourcesById.has(sourceId)) {
    throw new Error('That screen or window is no longer available')
  }
  selectedSourceId = sourceId
}

export function readCaptureSourceKind(sourceId: string): DesktopCaptureSourceKind {
  return sourceId.startsWith('screen:') ? 'screen' : 'window'
}

export function readWindowHandle(sourceId: string): number | undefined {
  const windowHandleMatch = WINDOW_SOURCE_ID_PATTERN.exec(sourceId)
  return windowHandleMatch ? Number(windowHandleMatch[1]) : undefined
}

export function handleDisplayMediaRequests(session: Session) {
  session.setDisplayMediaRequestHandler(async (request, grantCapture) => {
    const selectedSource = selectedSourceId ? listedSourcesById.get(selectedSourceId) : undefined
    selectedSourceId = undefined
    if (selectedSource) {
      grantCapture({ video: selectedSource })
      return
    }
    const [mainScreen] = await desktopCapturer.getSources({ types: ['screen'] })
    if (!mainScreen) {
      grantCapture({})
      return
    }
    grantCapture({ video: mainScreen, audio: request.audioRequested ? 'loopback' : undefined })
  })
}

function describeCaptureSource(capturerSource: DesktopCapturerSource): DesktopCaptureSource {
  const appIcon = capturerSource.appIcon
  return {
    id: capturerSource.id,
    name: capturerSource.name,
    kind: readCaptureSourceKind(capturerSource.id),
    thumbnailDataUrl: capturerSource.thumbnail.toDataURL(),
    appIconDataUrl: appIcon && !appIcon.isEmpty() ? appIcon.toDataURL() : undefined,
  }
}
