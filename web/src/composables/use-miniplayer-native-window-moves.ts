import { onScopeDispose } from 'vue'
import { readDesktopBridge } from '@/media/desktop-bridge'
import type { MiniplayerWindowMove } from '@/media/desktop-bridge-contract'
import { findTargetForWindowBox } from '@/media/miniplayer-drop-targets'
import { readContentScreenBoxAt } from '@/media/miniplayer-geometry'
import { readGroupIdFromWindowName } from '@/media/miniplayer-window'
import { findMiniplayerView } from '@/media/miniplayer-window-registry'
import { useMiniplayerStore } from '@/stores/miniplayer-store'

export function useMiniplayerNativeWindowMoves() {
  const miniplayerStore = useMiniplayerStore()
  let movingGroupId: string | undefined

  function readOnlyShareOf(groupId: string): string | undefined {
    const group = miniplayerStore.groups.find((candidateGroup) => candidateGroup.id === groupId)
    const [onlyUserId, ...otherUserIds] = group?.shareRows.flat() ?? []
    return otherUserIds.length === 0 ? onlyUserId : undefined
  }

  function finishWindowMove(groupId: string, userId: string) {
    if (movingGroupId !== groupId) {
      return
    }
    const finalDropTarget = miniplayerStore.dropTarget
    movingGroupId = undefined
    miniplayerStore.stopDragging()
    if (finalDropTarget) {
      miniplayerStore.moveShare(userId, finalDropTarget.userId, finalDropTarget.edge)
    }
  }

  function handleWindowMove(windowMove: MiniplayerWindowMove) {
    const groupId = readGroupIdFromWindowName(windowMove.windowName)
    const view = groupId ? findMiniplayerView(groupId) : undefined
    const userId = groupId ? readOnlyShareOf(groupId) : undefined
    if (!groupId || !view || !userId) {
      return
    }
    if (windowMove.hasFinished) {
      finishWindowMove(groupId, userId)
      return
    }
    if (miniplayerStore.draggedUserId && movingGroupId !== groupId) {
      return
    }
    movingGroupId = groupId
    miniplayerStore.startDragging(userId)
    const movedContentBox = readContentScreenBoxAt(view, windowMove.bounds.x, windowMove.bounds.y)
    miniplayerStore.showDropTarget(findTargetForWindowBox(groupId, userId, movedContentBox))
  }

  const stopListening = readDesktopBridge()?.onMiniplayerWindowMove?.(handleWindowMove)
  onScopeDispose(() => stopListening?.())
}
