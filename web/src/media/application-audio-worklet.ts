import { APPLICATION_AUDIO_PLAYER_NAME } from './application-audio-player-name'

declare abstract class AudioWorkletProcessor {
  readonly port: MessagePort
  abstract process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean
}

declare function registerProcessor(
  processorName: string,
  processorConstructor: new (options: AudioWorkletNodeOptions) => AudioWorkletProcessor,
): void

declare const sampleRate: number

const BUFFER_CAPACITY_SECONDS = 1
const PLAYBACK_START_SECONDS = 0.04
const MAXIMUM_DELAY_SECONDS = 0.2

class ApplicationAudioPlayer extends AudioWorkletProcessor {
  private readonly channelCount: number
  private readonly bufferCapacityFrames: number
  private readonly playbackStartFrames: number
  private readonly maximumDelayFrames: number
  private readonly bufferedSamples: Float32Array
  private readFrameIndex = 0
  private writeFrameIndex = 0
  private bufferedFrameCount = 0
  private isPlaying = false

  constructor(options: AudioWorkletNodeOptions) {
    super()
    this.channelCount = options.outputChannelCount?.[0] ?? 2
    this.bufferCapacityFrames = Math.round(sampleRate * BUFFER_CAPACITY_SECONDS)
    this.playbackStartFrames = Math.round(sampleRate * PLAYBACK_START_SECONDS)
    this.maximumDelayFrames = Math.round(sampleRate * MAXIMUM_DELAY_SECONDS)
    this.bufferedSamples = new Float32Array(this.bufferCapacityFrames * this.channelCount)
    this.port.onmessage = (portMessage: MessageEvent<{ samplesPort: MessagePort }>) => {
      portMessage.data.samplesPort.onmessage = (samplesMessage: MessageEvent<Float32Array>) =>
        this.storeSamples(samplesMessage.data)
    }
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const outputChannels = outputs[0] ?? []
    const outputFrameCount = outputChannels[0]?.length ?? 0
    if (!this.isPlaying && this.bufferedFrameCount >= this.playbackStartFrames) {
      this.isPlaying = true
    }
    if (!this.isPlaying) {
      return true
    }
    for (let frameIndex = 0; frameIndex < outputFrameCount; frameIndex += 1) {
      if (this.bufferedFrameCount === 0) {
        this.isPlaying = false
        break
      }
      const sampleOffset = this.readFrameIndex * this.channelCount
      outputChannels.forEach((outputChannel, channelIndex) => {
        outputChannel[frameIndex] =
          this.bufferedSamples[sampleOffset + Math.min(channelIndex, this.channelCount - 1)] ?? 0
      })
      this.readFrameIndex = (this.readFrameIndex + 1) % this.bufferCapacityFrames
      this.bufferedFrameCount -= 1
    }
    return true
  }

  private storeSamples(samples: Float32Array) {
    const incomingFrameCount = Math.floor(samples.length / this.channelCount)
    for (let frameIndex = 0; frameIndex < incomingFrameCount; frameIndex += 1) {
      const sampleOffset = this.writeFrameIndex * this.channelCount
      for (let channelIndex = 0; channelIndex < this.channelCount; channelIndex += 1) {
        this.bufferedSamples[sampleOffset + channelIndex] =
          samples[frameIndex * this.channelCount + channelIndex] ?? 0
      }
      this.writeFrameIndex = (this.writeFrameIndex + 1) % this.bufferCapacityFrames
      if (this.bufferedFrameCount === this.bufferCapacityFrames) {
        this.readFrameIndex = (this.readFrameIndex + 1) % this.bufferCapacityFrames
      } else {
        this.bufferedFrameCount += 1
      }
    }
    if (this.bufferedFrameCount > this.maximumDelayFrames) {
      this.skipBufferedFrames(this.bufferedFrameCount - this.playbackStartFrames)
    }
  }

  private skipBufferedFrames(skippedFrameCount: number) {
    this.readFrameIndex = (this.readFrameIndex + skippedFrameCount) % this.bufferCapacityFrames
    this.bufferedFrameCount -= skippedFrameCount
  }
}

registerProcessor(APPLICATION_AUDIO_PLAYER_NAME, ApplicationAudioPlayer)
