import { isRunningInDesktopApp, readDesktopBridge } from './desktop-bridge'
import {
  DRAG_GHOST_WINDOW_NAME,
  MINIPLAYER_WINDOW_NAME,
  type DesktopWindowOffset,
} from './desktop-bridge-contract'
import { isTouchOnlyDevice } from './device-capabilities'

export interface MiniplayerWindowSize {
  width: number
  height: number
}

export interface MiniplayerWindow {
  view: Window
  document: Document
  mountElement: HTMLElement
  readContentWidth(): number
  readMaximumContentSize(): MiniplayerWindowSize
  resizeContent(size: MiniplayerWindowSize): void
  close(): void
}

export interface MiniplayerScreenPosition {
  left: number
  top: number
}

export interface ScreenPlacement {
  left: number
  top: number
  width: number
  height: number
}

export interface DragGhostWindow {
  mountElement: HTMLElement
  moveTo(placement: ScreenPlacement): void
  close(): void
}

export interface MiniplayerWindowRequest {
  size: MiniplayerWindowSize
  title: string
  groupId: string
  screenPosition?: MiniplayerScreenPosition
}

interface PendingContentResize {
  requestedOuterSize: MiniplayerWindowSize
  wantedContentSize: MiniplayerWindowSize
  isCorrection: boolean
}

interface DocumentPictureInPicture {
  requestWindow(options: MiniplayerWindowSize): Promise<Window>
}

const MINIPLAYER_BODY_CLASSES = ['m-0', 'h-dvh', 'overflow-hidden', 'bg-neutral-950']
const DRAG_GHOST_BODY_CLASSES = ['m-0', 'h-dvh', 'overflow-hidden', 'bg-transparent']
const MINIPLAYER_MOUNT_CLASSES = ['h-full']
const MAXIMUM_SCREEN_SHARE = 0.9
const SCREEN_CORNER_MARGIN = 24
const SIDE_BY_SIDE_WINDOW_GAP = 16
const MAXIMUM_LEARNED_FRAME_PIXELS = 64
const LAYOUT_CHECK_INTERVAL_MILLISECONDS = 50
const MAXIMUM_LAYOUT_CHECKS = 40

function readDocumentPictureInPicture(): DocumentPictureInPicture | undefined {
  return Reflect.get(window, 'documentPictureInPicture') as DocumentPictureInPicture | undefined
}

export function canUseMiniplayer(): boolean {
  return !isTouchOnlyDevice()
}

export function canSeparateMiniplayers(): boolean {
  return readDesktopBridge()?.canOpenSeparateMiniplayers === true
}

export function canOpenFloatingMiniplayer(): boolean {
  return isRunningInDesktopApp() || readDocumentPictureInPicture() !== undefined
}

function readScreenEdge(view: Window, edgeName: 'availLeft' | 'availTop'): number {
  const edge: unknown = Reflect.get(view.screen, edgeName)
  return typeof edge === 'number' ? edge : 0
}

export function placeBesideWindow(view: Window, newWindowWidth: number): number {
  const screenLeft = readScreenEdge(view, 'availLeft')
  const screenRight = screenLeft + view.screen.availWidth
  const rightSideLeft = view.screenX + view.outerWidth + SIDE_BY_SIDE_WINDOW_GAP
  const leftSideLeft = view.screenX - SIDE_BY_SIDE_WINDOW_GAP - newWindowWidth
  const fitsOnTheRight = rightSideLeft + newWindowWidth <= screenRight
  return fitsOnTheRight || leftSideLeft < screenLeft ? rightSideLeft : leftSideLeft
}

function readBottomRightOfAppScreen(size: MiniplayerWindowSize): MiniplayerScreenPosition {
  return {
    left:
      readScreenEdge(window, 'availLeft') +
      window.screen.availWidth -
      size.width -
      SCREEN_CORNER_MARGIN,
    top:
      readScreenEdge(window, 'availTop') +
      window.screen.availHeight -
      size.height -
      SCREEN_CORNER_MARGIN,
  }
}

function describeWindowFeatures(request: MiniplayerWindowRequest): string {
  const { left, top } = request.screenPosition ?? readBottomRightOfAppScreen(request.size)
  return `width=${request.size.width},height=${request.size.height},left=${Math.round(left)},top=${Math.round(top)}`
}

export function readGroupIdFromWindowName(windowName: string): string | undefined {
  const groupWindowNamePrefix = `${MINIPLAYER_WINDOW_NAME}-`
  return windowName.startsWith(groupWindowNamePrefix)
    ? windowName.slice(groupWindowNamePrefix.length)
    : undefined
}

function readDesktopWindowName(groupId: string): string {
  return canSeparateMiniplayers() ? `${MINIPLAYER_WINDOW_NAME}-${groupId}` : MINIPLAYER_WINDOW_NAME
}

export function moveFloatingWindowBy(view: Window, groupId: string, offset: DesktopWindowOffset) {
  const desktopBridge = readDesktopBridge()
  if (desktopBridge?.moveMiniplayerWindowBy) {
    void desktopBridge.moveMiniplayerWindowBy(readDesktopWindowName(groupId), offset)
    return
  }
  view.moveBy(offset.x, offset.y)
}

async function requestFloatingWindow(
  request: MiniplayerWindowRequest,
): Promise<Window | undefined> {
  if (isRunningInDesktopApp()) {
    const openedWindow = window.open(
      '',
      readDesktopWindowName(request.groupId),
      describeWindowFeatures(request),
    )
    return openedWindow ?? undefined
  }
  const documentPictureInPicture = readDocumentPictureInPicture()
  if (!documentPictureInPicture) {
    return undefined
  }
  try {
    return await documentPictureInPicture.requestWindow(request.size)
  } catch {
    return undefined
  }
}

async function waitUntilLaidOut(floatingWindow: Window) {
  for (
    let check = 0;
    check < MAXIMUM_LAYOUT_CHECKS && floatingWindow.innerWidth === 0;
    check += 1
  ) {
    await new Promise((resolve) => setTimeout(resolve, LAYOUT_CHECK_INTERVAL_MILLISECONDS))
  }
}

function copyStyleSheets(targetDocument: Document) {
  for (const styleSheet of [...document.styleSheets]) {
    try {
      const styleElement = targetDocument.createElement('style')
      styleElement.textContent = [...styleSheet.cssRules].map((rule) => rule.cssText).join('\n')
      targetDocument.head.append(styleElement)
    } catch {
      if (styleSheet.href) {
        const linkElement = targetDocument.createElement('link')
        linkElement.rel = 'stylesheet'
        linkElement.href = styleSheet.href
        targetDocument.head.append(linkElement)
      }
    }
  }
}

function prepareMiniplayerDocument(
  targetDocument: Document,
  title: string,
  bodyClasses: string[],
): HTMLElement {
  targetDocument.head.replaceChildren()
  targetDocument.title = title
  copyStyleSheets(targetDocument)
  targetDocument.documentElement.className = document.documentElement.className
  targetDocument.body.replaceChildren()
  targetDocument.body.classList.add(...bodyClasses)
  const mountElement = targetDocument.createElement('div')
  mountElement.classList.add(...MINIPLAYER_MOUNT_CLASSES)
  targetDocument.body.append(mountElement)
  return mountElement
}

export async function openFloatingMiniplayerWindow(
  request: MiniplayerWindowRequest,
  onClosed: () => void,
): Promise<MiniplayerWindow | undefined> {
  const floatingWindow = await requestFloatingWindow(request)
  if (!floatingWindow) {
    return undefined
  }
  await waitUntilLaidOut(floatingWindow)
  const mountElement = prepareMiniplayerDocument(
    floatingWindow.document,
    request.title,
    MINIPLAYER_BODY_CLASSES,
  )
  floatingWindow.addEventListener('pagehide', onClosed, { once: true })
  const readFrameSize = () => ({
    width: floatingWindow.outerWidth - floatingWindow.innerWidth,
    height: floatingWindow.outerHeight - floatingWindow.innerHeight,
  })
  let learnedFrameSize: MiniplayerWindowSize | undefined
  let pendingContentResize: PendingContentResize | undefined
  const readOuterAllowance = () => learnedFrameSize ?? readFrameSize()
  const learnFrameLength = (requestedLength: number, contentLength: number, guess: number) => {
    const frameLength = requestedLength - contentLength
    return Math.abs(frameLength) <= MAXIMUM_LEARNED_FRAME_PIXELS ? frameLength : guess
  }
  const requestContentSize = (wantedContentSize: MiniplayerWindowSize, isCorrection: boolean) => {
    const outerAllowance = readOuterAllowance()
    const requestedOuterSize = {
      width: Math.round(wantedContentSize.width + outerAllowance.width),
      height: Math.round(wantedContentSize.height + outerAllowance.height),
    }
    pendingContentResize = { requestedOuterSize, wantedContentSize, isCorrection }
    try {
      floatingWindow.resizeTo(requestedOuterSize.width, requestedOuterSize.height)
    } catch {
      pendingContentResize = undefined
    }
  }
  floatingWindow.addEventListener('resize', () => {
    const resize = pendingContentResize
    if (!resize) {
      return
    }
    pendingContentResize = undefined
    const outerAllowance = readOuterAllowance()
    learnedFrameSize = {
      width: learnFrameLength(
        resize.requestedOuterSize.width,
        floatingWindow.innerWidth,
        outerAllowance.width,
      ),
      height: learnFrameLength(
        resize.requestedOuterSize.height,
        floatingWindow.innerHeight,
        outerAllowance.height,
      ),
    }
    const isOffTarget =
      Math.abs(floatingWindow.innerWidth - resize.wantedContentSize.width) > 1 ||
      Math.abs(floatingWindow.innerHeight - resize.wantedContentSize.height) > 1
    if (isOffTarget && !resize.isCorrection) {
      requestContentSize(resize.wantedContentSize, true)
    }
  })
  return {
    view: floatingWindow,
    document: floatingWindow.document,
    mountElement,
    readContentWidth: () => floatingWindow.innerWidth,
    readMaximumContentSize: () => {
      const frameSize = readOuterAllowance()
      return {
        width: floatingWindow.screen.availWidth * MAXIMUM_SCREEN_SHARE - frameSize.width,
        height: floatingWindow.screen.availHeight * MAXIMUM_SCREEN_SHARE - frameSize.height,
      }
    },
    resizeContent: (size) => requestContentSize(size, false),
    close: () => {
      floatingWindow.removeEventListener('pagehide', onClosed)
      floatingWindow.close()
    },
  }
}

function describePlacementFeatures(placement: ScreenPlacement): string {
  return [
    `width=${Math.round(placement.width)}`,
    `height=${Math.round(placement.height)}`,
    `left=${Math.round(placement.left)}`,
    `top=${Math.round(placement.top)}`,
  ].join(',')
}

export async function openDragGhostWindow(
  placement: ScreenPlacement,
): Promise<DragGhostWindow | undefined> {
  const ghostWindow = window.open('', DRAG_GHOST_WINDOW_NAME, describePlacementFeatures(placement))
  if (!ghostWindow) {
    return undefined
  }
  await waitUntilLaidOut(ghostWindow)
  const mountElement = prepareMiniplayerDocument(
    ghostWindow.document,
    'Screenshare',
    DRAG_GHOST_BODY_CLASSES,
  )
  return {
    mountElement,
    moveTo: (nextPlacement) => {
      ghostWindow.moveTo(Math.round(nextPlacement.left), Math.round(nextPlacement.top))
    },
    close: () => ghostWindow.close(),
  }
}
