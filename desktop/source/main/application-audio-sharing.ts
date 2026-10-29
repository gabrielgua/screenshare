import { MessageChannelMain, type MessagePortMain, type WebContents } from 'electron'
import type { StartedApplicationAudio } from '../../../web/src/media/desktop-bridge-contract'
import { APPLICATION_AUDIO_PORT_CHANNEL } from '../shared/desktop-ipc-channels'
import {
  loadApplicationAudioAddon,
  type ApplicationAudioCapture,
  type ApplicationAudioFilter,
} from './application-audio-addon'
import { readCaptureSourceKind, readWindowHandle } from './screen-capture-sources'

interface ActiveApplicationAudio {
  captureId: number
  capture: ApplicationAudioCapture
  samplesPort: MessagePortMain
}

const NEVER_SHARED_EXECUTABLE_NAMES = [
  'Discord.exe',
  'DiscordPTB.exe',
  'DiscordCanary.exe',
  'DiscordDevelopment.exe',
]

let activeApplicationAudio: ActiveApplicationAudio | undefined
let latestCaptureId = 0

export function startApplicationAudio(
  sourceId: string,
  receivingContents: WebContents,
): StartedApplicationAudio {
  stopApplicationAudio()
  const addon = loadApplicationAudioAddon()
  const audioFilter = describeApplicationAudioFilter(sourceId)
  latestCaptureId += 1
  const captureId = latestCaptureId
  const { port1: samplesPort, port2: receivingPort } = new MessageChannelMain()
  const capture = new addon.ApplicationAudioCapture({
    ...audioFilter,
    onSamplesCaptured: (samples) => samplesPort.postMessage(samples),
    onCaptureFailed: (failureDescription) => {
      console.error(`Application audio capture failed: ${failureDescription}`)
      stopApplicationAudio(captureId)
    },
  })
  receivingContents.postMessage(APPLICATION_AUDIO_PORT_CHANNEL, { captureId }, [receivingPort])
  capture.start()
  activeApplicationAudio = { captureId, capture, samplesPort }
  return {
    captureId,
    sampleRate: addon.capturedSampleRate,
    channelCount: addon.capturedChannelCount,
  }
}

export function stopApplicationAudio(captureId?: number) {
  if (!activeApplicationAudio) {
    return
  }
  if (captureId !== undefined && activeApplicationAudio.captureId !== captureId) {
    return
  }
  const { capture, samplesPort } = activeApplicationAudio
  activeApplicationAudio = undefined
  capture.stop()
  samplesPort.close()
}

function readSharedProcessId(sourceId: string): number {
  if (readCaptureSourceKind(sourceId) === 'screen') {
    return 0
  }
  const windowHandle = readWindowHandle(sourceId)
  const processId =
    windowHandle === undefined ? 0 : loadApplicationAudioAddon().findWindowProcessId(windowHandle)
  if (processId === 0) {
    throw new Error('That window was closed')
  }
  return processId
}

function describeApplicationAudioFilter(sourceId: string): ApplicationAudioFilter {
  return {
    scopeProcessId: readSharedProcessId(sourceId),
    excludedProcessId: process.pid,
    excludedExecutableNames: NEVER_SHARED_EXECUTABLE_NAMES,
  }
}
