import {
  APPLICATION_AUDIO_PORT_MESSAGE_TYPE,
  DESKTOP_BRIDGE_GLOBAL_NAME,
  type DesktopBridge,
} from './desktop-bridge-contract'
import { isTouchOnlyDevice } from './device-capabilities'

interface ApplicationAudioPortMessage {
  type: typeof APPLICATION_AUDIO_PORT_MESSAGE_TYPE
  captureId: number
}

export const DESKTOP_APP_DOWNLOAD_ADDRESS =
  'https://github.com/gabrielgua/screenshare/releases/latest/download/ScreenshareSetup.exe'

const WINDOWS_USER_AGENT_PATTERN = /Windows NT/

const receivedPortsByCaptureId = new Map<number, MessagePort>()
const portWaitersByCaptureId = new Map<number, (samplesPort: MessagePort) => void>()

export function readDesktopBridge(): DesktopBridge | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }
  return Reflect.get(window, DESKTOP_BRIDGE_GLOBAL_NAME) as DesktopBridge | undefined
}

export function isRunningInDesktopApp(): boolean {
  return readDesktopBridge() !== undefined
}

export function canInstallDesktopApp(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    WINDOWS_USER_AGENT_PATTERN.test(navigator.userAgent) &&
    !isTouchOnlyDevice() &&
    !isRunningInDesktopApp()
  )
}

export function openDesktopAppDownload() {
  window.open(DESKTOP_APP_DOWNLOAD_ADDRESS, '_blank', 'noopener')
}

export function receiveApplicationAudioPort(captureId: number): Promise<MessagePort> {
  const receivedPort = receivedPortsByCaptureId.get(captureId)
  if (receivedPort) {
    receivedPortsByCaptureId.delete(captureId)
    return Promise.resolve(receivedPort)
  }
  return new Promise((resolve) => portWaitersByCaptureId.set(captureId, resolve))
}

function isApplicationAudioPortMessage(message: unknown): message is ApplicationAudioPortMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    Reflect.get(message, 'type') === APPLICATION_AUDIO_PORT_MESSAGE_TYPE &&
    typeof Reflect.get(message, 'captureId') === 'number'
  )
}

function handleWindowMessage(messageEvent: MessageEvent) {
  const [samplesPort] = messageEvent.ports
  if (
    messageEvent.source !== window ||
    messageEvent.origin !== window.location.origin ||
    !samplesPort ||
    !isApplicationAudioPortMessage(messageEvent.data)
  ) {
    return
  }
  const { captureId } = messageEvent.data
  const waitingForPort = portWaitersByCaptureId.get(captureId)
  if (waitingForPort) {
    portWaitersByCaptureId.delete(captureId)
    waitingForPort(samplesPort)
    return
  }
  receivedPortsByCaptureId.set(captureId, samplesPort)
}

if (isRunningInDesktopApp()) {
  window.addEventListener('message', handleWindowMessage)
}
