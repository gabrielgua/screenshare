import type { PeerSignal } from './room-signaling-messages'
import {
  readFrameSize,
  readMaximumBitrate,
  THUMBNAIL_FRAME_WIDTH,
  THUMBNAIL_MAXIMUM_BITRATE,
  THUMBNAIL_MAXIMUM_FRAME_RATE,
  type RemoteViewQuality,
  type ScreenShareSettings,
} from './screen-share-quality'

export interface LocalScreenShare {
  stream: MediaStream
  settings: ScreenShareSettings
}

interface RoomPeerLinkCallbacks {
  sendSignal: (signal: PeerSignal) => void
  onRemoteStreamChange: (stream: MediaStream | undefined) => void
}

interface ScreenShareSendParameters extends RTCRtpSendParameters {
  degradationPreference?: 'maintain-framerate' | 'maintain-resolution' | 'balanced'
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
]

const CANDIDATE_BATCH_DELAY_MILLISECONDS = 200

const PREFERRED_VIDEO_CODEC_MIME_TYPES = ['video/H264', 'video/VP9', 'video/VP8']

const PREFERRED_H264_PROFILE_PREFIXES = [
  'profile-level-id=64',
  'profile-level-id=4d',
  'profile-level-id=42e0',
]

function rankH264Profile(codec: RTCRtpCodec): number {
  const profileRank = PREFERRED_H264_PROFILE_PREFIXES.findIndex((profilePrefix) =>
    codec.sdpFmtpLine?.includes(profilePrefix),
  )
  return profileRank === -1 ? PREFERRED_H264_PROFILE_PREFIXES.length : profileRank
}

function rankVideoCodec(codec: RTCRtpCodec): number {
  const codecRank = PREFERRED_VIDEO_CODEC_MIME_TYPES.indexOf(codec.mimeType)
  if (codecRank === -1) {
    return PREFERRED_VIDEO_CODEC_MIME_TYPES.length * 10
  }
  return codecRank * 10 + (codec.mimeType === 'video/H264' ? rankH264Profile(codec) : 0)
}

function readTrackKinds(stream: MediaStream | undefined): string {
  return (stream?.getTracks() ?? [])
    .map((track) => track.kind)
    .sort()
    .join(',')
}

export class RoomPeerLink {
  readonly connection: RTCPeerConnection

  private isMakingOffer = false

  private isIgnoringOffer = false

  private pendingSignalWork: Promise<void> = Promise.resolve()

  private remoteViewQuality: RemoteViewQuality = 'full'

  private localShare: LocalScreenShare | undefined

  private readonly sendersByTrackKind = new Map<string, RTCRtpSender>()

  private currentRemoteStream: MediaStream | undefined

  private pendingLocalCandidates: RTCIceCandidateInit[] = []

  private candidateBatchTimer: ReturnType<typeof setTimeout> | undefined

  constructor(
    private readonly isPolite: boolean,
    private readonly callbacks: RoomPeerLinkCallbacks,
  ) {
    this.connection = new RTCPeerConnection({ iceServers: ICE_SERVERS, bundlePolicy: 'max-bundle' })
    this.connection.onnegotiationneeded = () => {
      void this.sendLocalDescription()
    }
    this.connection.onicecandidate = ({ candidate }) => {
      if (!candidate) {
        this.flushLocalCandidates()
        return
      }
      this.pendingLocalCandidates.push(candidate.toJSON())
      this.candidateBatchTimer ??= setTimeout(
        () => this.flushLocalCandidates(),
        CANDIDATE_BATCH_DELAY_MILLISECONDS,
      )
    }
    this.connection.ontrack = ({ track, streams }) => {
      const remoteStream = streams[0] ?? new MediaStream([track])
      remoteStream.onremovetrack = () => {
        if (remoteStream.getTracks().length === 0 && this.currentRemoteStream === remoteStream) {
          this.currentRemoteStream = undefined
          this.callbacks.onRemoteStreamChange(undefined)
        }
      }
      this.currentRemoteStream = remoteStream
      this.callbacks.onRemoteStreamChange(remoteStream)
    }
    this.connection.onconnectionstatechange = () => {
      if (this.connection.connectionState === 'connected') {
        void this.applyEncodingParameters()
      }
    }
  }

  handleSignal(signal: PeerSignal) {
    this.pendingSignalWork = this.pendingSignalWork
      .then(() => this.processSignal(signal))
      .catch(() => undefined)
  }

  setLocalShare(nextLocalShare: LocalScreenShare | undefined) {
    const hasSameTrackKinds =
      this.sendersByTrackKind.size > 0 &&
      readTrackKinds(nextLocalShare?.stream) === readTrackKinds(this.localShare?.stream)
    this.localShare = nextLocalShare
    if (hasSameTrackKinds && nextLocalShare) {
      nextLocalShare.stream.getTracks().forEach((track) => {
        void this.sendersByTrackKind.get(track.kind)?.replaceTrack(track)
      })
      void this.applyEncodingParameters()
      return
    }
    this.sendersByTrackKind.forEach((sender) => this.connection.removeTrack(sender))
    this.sendersByTrackKind.clear()
    nextLocalShare?.stream.getTracks().forEach((track) => {
      const sender = this.connection.addTrack(track, nextLocalShare.stream)
      this.sendersByTrackKind.set(track.kind, sender)
      if (track.kind === 'video') {
        this.preferEfficientVideoCodecs(sender)
      }
    })
    void this.applyEncodingParameters()
  }

  close() {
    clearTimeout(this.candidateBatchTimer)
    this.connection.close()
  }

  private flushLocalCandidates() {
    clearTimeout(this.candidateBatchTimer)
    this.candidateBatchTimer = undefined
    if (this.pendingLocalCandidates.length === 0) {
      return
    }
    this.callbacks.sendSignal({ kind: 'candidates', candidates: this.pendingLocalCandidates })
    this.pendingLocalCandidates = []
  }

  private async sendLocalDescription() {
    try {
      this.isMakingOffer = true
      await this.connection.setLocalDescription()
      this.announceLocalDescription()
    } catch {
      return
    } finally {
      this.isMakingOffer = false
    }
  }

  private announceLocalDescription() {
    if (this.connection.localDescription) {
      this.callbacks.sendSignal({
        kind: 'description',
        description: this.connection.localDescription.toJSON(),
      })
    }
  }

  private async processSignal(signal: PeerSignal) {
    if (signal.kind === 'description') {
      const isOfferCollision =
        signal.description.type === 'offer' &&
        (this.isMakingOffer || this.connection.signalingState !== 'stable')
      this.isIgnoringOffer = !this.isPolite && isOfferCollision
      if (this.isIgnoringOffer) {
        return
      }
      await this.connection.setRemoteDescription(signal.description)
      if (signal.description.type === 'offer') {
        await this.connection.setLocalDescription()
        this.announceLocalDescription()
      }
      return
    }
    if (signal.kind === 'candidates') {
      for (const candidate of signal.candidates) {
        try {
          await this.connection.addIceCandidate(candidate)
        } catch (candidateError) {
          if (!this.isIgnoringOffer) {
            throw candidateError
          }
        }
      }
      return
    }
    this.remoteViewQuality = signal.viewQuality
    await this.applyEncodingParameters()
  }

  private preferEfficientVideoCodecs(videoSender: RTCRtpSender) {
    const transceiver = this.connection
      .getTransceivers()
      .find((candidateTransceiver) => candidateTransceiver.sender === videoSender)
    const videoCapabilities = RTCRtpReceiver.getCapabilities('video')
    if (!transceiver || !videoCapabilities || !('setCodecPreferences' in transceiver)) {
      return
    }
    const orderedCodecs = [...videoCapabilities.codecs].sort(
      (firstCodec, secondCodec) => rankVideoCodec(firstCodec) - rankVideoCodec(secondCodec),
    )
    try {
      transceiver.setCodecPreferences(orderedCodecs)
    } catch {
      return
    }
  }

  private async applyEncodingParameters() {
    const videoSender = this.sendersByTrackKind.get('video')
    if (!videoSender || !this.localShare) {
      return
    }
    const sendParameters = videoSender.getParameters() as ScreenShareSendParameters
    const firstEncoding = sendParameters.encodings?.[0]
    if (!firstEncoding) {
      return
    }
    const { settings } = this.localShare
    const isThumbnail = this.remoteViewQuality === 'thumbnail'
    const capturedWidth =
      videoSender.track?.getSettings().width ?? readFrameSize(settings.resolution).width
    firstEncoding.maxBitrate = isThumbnail
      ? THUMBNAIL_MAXIMUM_BITRATE
      : readMaximumBitrate(settings.resolution, settings.frameRate)
    firstEncoding.maxFramerate = isThumbnail
      ? Math.min(settings.frameRate, THUMBNAIL_MAXIMUM_FRAME_RATE)
      : settings.frameRate
    firstEncoding.scaleResolutionDownBy = isThumbnail
      ? Math.max(1, capturedWidth / THUMBNAIL_FRAME_WIDTH)
      : 1
    sendParameters.degradationPreference =
      settings.frameRate === 60 ? 'maintain-framerate' : 'maintain-resolution'
    try {
      await videoSender.setParameters(sendParameters)
    } catch {
      return
    }
  }
}
