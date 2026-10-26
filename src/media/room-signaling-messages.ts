import type { RemoteViewQuality } from './screen-share-quality'

export type PeerSignal =
  | { kind: 'description'; description: RTCSessionDescriptionInit }
  | { kind: 'candidates'; candidates: RTCIceCandidateInit[] }
  | { kind: 'view-preference'; viewQuality: RemoteViewQuality }

export type RoomSignalingMessage = PeerSignal & {
  senderId: string
  recipientId: string
}
