import applicationAudioWorkletAddress from './application-audio-worklet.ts?worker&url'
import { APPLICATION_AUDIO_PLAYER_NAME } from './application-audio-player-name'
import { receiveApplicationAudioPort } from './desktop-bridge'
import type { DesktopBridge } from './desktop-bridge-contract'

const releaseApplicationAudioByTrack = new WeakMap<MediaStreamTrack, () => void>()

export async function createApplicationAudioTrack(
  desktopBridge: DesktopBridge,
  sourceId: string,
): Promise<MediaStreamTrack> {
  const startedAudio = await desktopBridge.startApplicationAudio(sourceId)
  const stopNativeCapture = () => void desktopBridge.stopApplicationAudio(startedAudio.captureId)
  try {
    const samplesPort = await receiveApplicationAudioPort(startedAudio.captureId)
    const audioContext = new AudioContext({
      sampleRate: startedAudio.sampleRate,
      latencyHint: 'interactive',
    })
    await audioContext.audioWorklet.addModule(applicationAudioWorkletAddress)
    const playerNode = new AudioWorkletNode(audioContext, APPLICATION_AUDIO_PLAYER_NAME, {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [startedAudio.channelCount],
    })
    playerNode.port.postMessage({ samplesPort }, [samplesPort])
    const streamDestination = audioContext.createMediaStreamDestination()
    playerNode.connect(streamDestination)
    await audioContext.resume()
    const [applicationAudioTrack] = streamDestination.stream.getAudioTracks()
    if (!applicationAudioTrack) {
      throw new Error('Could not create the audio track')
    }
    releaseApplicationAudioByTrack.set(applicationAudioTrack, () => {
      stopNativeCapture()
      void audioContext.close()
    })
    return applicationAudioTrack
  } catch (audioError) {
    stopNativeCapture()
    throw audioError
  }
}

export function releaseApplicationAudioTrack(track: MediaStreamTrack) {
  const releaseApplicationAudio = releaseApplicationAudioByTrack.get(track)
  if (!releaseApplicationAudio) {
    return
  }
  releaseApplicationAudioByTrack.delete(track)
  releaseApplicationAudio()
}
