import { RoomPeerLink, type LocalScreenShare } from './room-peer-link'
import type { RoomSignalingMessage } from './room-signaling-messages'
import type { RemoteViewQuality } from './screen-share-quality'

interface RoomPeerMeshOptions {
  currentUserId: string
  sendMessage: (message: RoomSignalingMessage) => void
  onRemoteStreamChange: (userId: string, stream: MediaStream | undefined) => void
}

export class RoomPeerMesh {
  private readonly linksByUserId = new Map<string, RoomPeerLink>()

  private presentUserIds = new Set<string>()

  private localShare: LocalScreenShare | undefined

  constructor(private readonly options: RoomPeerMeshOptions) {}

  syncPresentUsers(nextPresentUserIds: string[]) {
    const nextPresentUserIdSet = new Set(
      nextPresentUserIds.filter((userId) => userId !== this.options.currentUserId),
    )
    this.presentUserIds.forEach((userId) => {
      if (!nextPresentUserIdSet.has(userId)) {
        this.removeLink(userId)
      }
    })
    nextPresentUserIdSet.forEach((userId) => this.ensureLink(userId))
    this.presentUserIds = nextPresentUserIdSet
  }

  handleMessage(message: RoomSignalingMessage) {
    if (message.recipientId !== this.options.currentUserId) {
      return
    }
    this.ensureLink(message.senderId).handleSignal(message)
  }

  setLocalShare(nextLocalShare: LocalScreenShare | undefined) {
    this.localShare = nextLocalShare
    this.linksByUserId.forEach((link) => link.setLocalShare(nextLocalShare))
  }

  sendViewPreference(sharerUserId: string, viewQuality: RemoteViewQuality) {
    this.options.sendMessage({
      kind: 'view-preference',
      viewQuality,
      senderId: this.options.currentUserId,
      recipientId: sharerUserId,
    })
  }

  close() {
    this.linksByUserId.forEach((link) => link.close())
    this.linksByUserId.clear()
    this.presentUserIds.clear()
  }

  private ensureLink(userId: string): RoomPeerLink {
    const existingLink = this.linksByUserId.get(userId)
    if (existingLink) {
      return existingLink
    }
    const newLink = new RoomPeerLink(this.options.currentUserId < userId, {
      sendSignal: (signal) =>
        this.options.sendMessage({
          ...signal,
          senderId: this.options.currentUserId,
          recipientId: userId,
        }),
      onRemoteStreamChange: (stream) => this.options.onRemoteStreamChange(userId, stream),
    })
    this.linksByUserId.set(userId, newLink)
    if (this.localShare) {
      newLink.setLocalShare(this.localShare)
    }
    return newLink
  }

  private removeLink(userId: string) {
    this.linksByUserId.get(userId)?.close()
    this.linksByUserId.delete(userId)
    this.options.onRemoteStreamChange(userId, undefined)
  }
}
