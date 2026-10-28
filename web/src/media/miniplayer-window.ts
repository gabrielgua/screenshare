import { isRunningInDesktopApp } from './desktop-bridge'
import { MINIPLAYER_WINDOW_NAME } from './desktop-bridge-contract'
import { isTouchOnlyDevice } from './device-capabilities'

export interface MiniplayerWindowSize {
  width: number
  height: number
}

export interface MiniplayerWindow {
  document: Document
  mountElement: HTMLElement
  readContentWidth(): number
  readMaximumContentHeight(): number
  resizeContent(size: MiniplayerWindowSize): void
  close(): void
}

interface DocumentPictureInPicture {
  requestWindow(options: MiniplayerWindowSize): Promise<Window>
}

const MINIPLAYER_BODY_CLASSES = [
  'm-0',
  'h-dvh',
  'overflow-hidden',
  'bg-neutral-100',
  'dark:bg-neutral-950',
]
const MINIPLAYER_MOUNT_CLASSES = ['h-full']
const MAXIMUM_SCREEN_HEIGHT_SHARE = 0.9

function readDocumentPictureInPicture(): DocumentPictureInPicture | undefined {
  return Reflect.get(window, 'documentPictureInPicture') as DocumentPictureInPicture | undefined
}

export function canUseMiniplayer(): boolean {
  return !isTouchOnlyDevice()
}

export function canOpenFloatingMiniplayer(): boolean {
  return isRunningInDesktopApp() || readDocumentPictureInPicture() !== undefined
}

async function requestFloatingWindow(size: MiniplayerWindowSize): Promise<Window | undefined> {
  if (isRunningInDesktopApp()) {
    const openedWindow = window.open(
      '',
      MINIPLAYER_WINDOW_NAME,
      `width=${size.width},height=${size.height}`,
    )
    return openedWindow ?? undefined
  }
  const documentPictureInPicture = readDocumentPictureInPicture()
  if (!documentPictureInPicture) {
    return undefined
  }
  try {
    return await documentPictureInPicture.requestWindow(size)
  } catch {
    return undefined
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

function prepareMiniplayerDocument(targetDocument: Document, title: string): HTMLElement {
  targetDocument.head.replaceChildren()
  targetDocument.title = title
  copyStyleSheets(targetDocument)
  targetDocument.documentElement.className = document.documentElement.className
  targetDocument.body.replaceChildren()
  targetDocument.body.classList.add(...MINIPLAYER_BODY_CLASSES)
  const mountElement = targetDocument.createElement('div')
  mountElement.classList.add(...MINIPLAYER_MOUNT_CLASSES)
  targetDocument.body.append(mountElement)
  return mountElement
}

export async function openFloatingMiniplayerWindow(
  size: MiniplayerWindowSize,
  title: string,
  onClosed: () => void,
): Promise<MiniplayerWindow | undefined> {
  const floatingWindow = await requestFloatingWindow(size)
  if (!floatingWindow) {
    return undefined
  }
  const mountElement = prepareMiniplayerDocument(floatingWindow.document, title)
  floatingWindow.addEventListener('pagehide', onClosed, { once: true })
  const readFrameSize = () => ({
    width: floatingWindow.outerWidth - floatingWindow.innerWidth,
    height: floatingWindow.outerHeight - floatingWindow.innerHeight,
  })
  return {
    document: floatingWindow.document,
    mountElement,
    readContentWidth: () => floatingWindow.innerWidth,
    readMaximumContentHeight: () =>
      floatingWindow.screen.availHeight * MAXIMUM_SCREEN_HEIGHT_SHARE - readFrameSize().height,
    resizeContent: (size) => {
      const frameSize = readFrameSize()
      try {
        floatingWindow.resizeTo(
          Math.round(size.width + frameSize.width),
          Math.round(size.height + frameSize.height),
        )
      } catch {
        return
      }
    },
    close: () => {
      floatingWindow.removeEventListener('pagehide', onClosed)
      floatingWindow.close()
    },
  }
}
