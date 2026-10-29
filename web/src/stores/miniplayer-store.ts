import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type MiniplayerDropEdge = 'left' | 'right' | 'top' | 'bottom'

export interface MiniplayerDropTarget {
  userId: string
  edge: MiniplayerDropEdge
}

export interface MiniplayerScreenPlacement {
  left: number
  top: number
  tileWidth: number
}

export interface MiniplayerDragGhost {
  userId: string
  left: number
  top: number
  width: number
  height: number
}

export interface MiniplayerGroup {
  id: string
  shareRows: string[][]
  openingPlacement?: MiniplayerScreenPlacement
}

interface SharePlace {
  rowIndex: number
  columnIndex: number
}

function findSharePlace(rows: string[][], userId: string): SharePlace | undefined {
  for (const [rowIndex, row] of rows.entries()) {
    const columnIndex = row.indexOf(userId)
    if (columnIndex !== -1) {
      return { rowIndex, columnIndex }
    }
  }
  return undefined
}

function keepSharesWhere(
  rows: string[][],
  shouldKeepShare: (userId: string) => boolean,
): string[][] {
  return rows.map((row) => row.filter(shouldKeepShare)).filter((row) => row.length > 0)
}

function insertShareNextTo(
  rows: string[][],
  userId: string,
  targetPlace: SharePlace,
  edge: MiniplayerDropEdge,
): string[][] {
  const rearrangedRows = rows.map((row) => [...row])
  if (edge === 'left' || edge === 'right') {
    const insertIndex = targetPlace.columnIndex + (edge === 'right' ? 1 : 0)
    rearrangedRows[targetPlace.rowIndex]?.splice(insertIndex, 0, userId)
  } else {
    const insertIndex = targetPlace.rowIndex + (edge === 'bottom' ? 1 : 0)
    rearrangedRows.splice(insertIndex, 0, [userId])
  }
  return rearrangedRows
}

export const useMiniplayerStore = defineStore('miniplayer', () => {
  const groups = ref<MiniplayerGroup[]>([])
  const draggedUserId = ref<string>()
  const dropTarget = ref<MiniplayerDropTarget>()
  const dragGhost = ref<MiniplayerDragGhost>()

  const miniplayerUserIds = computed(() => groups.value.flatMap((group) => group.shareRows.flat()))
  const isOpen = computed(() => miniplayerUserIds.value.length > 0)

  function containsShare(userId: string): boolean {
    return miniplayerUserIds.value.includes(userId)
  }

  function keepGroupSharesWhere(shouldKeepShare: (userId: string) => boolean) {
    groups.value = groups.value
      .map((group) => ({ ...group, shareRows: keepSharesWhere(group.shareRows, shouldKeepShare) }))
      .filter((group) => group.shareRows.length > 0)
  }

  function showShares(userIds: string[]) {
    const addedRows = userIds.filter((userId) => !containsShare(userId)).map((userId) => [userId])
    if (addedRows.length === 0) {
      return
    }
    const [firstGroup, ...otherGroups] = groups.value
    groups.value = firstGroup
      ? [{ ...firstGroup, shareRows: [...firstGroup.shareRows, ...addedRows] }, ...otherGroups]
      : [{ id: crypto.randomUUID(), shareRows: addedRows }]
  }

  function returnShare(userId: string) {
    keepGroupSharesWhere((sharedUserId) => sharedUserId !== userId)
  }

  function moveShare(userId: string, targetUserId: string, edge: MiniplayerDropEdge) {
    if (userId === targetUserId) {
      return
    }
    keepGroupSharesWhere((sharedUserId) => sharedUserId !== userId)
    groups.value = groups.value.map((group) => {
      const targetPlace = findSharePlace(group.shareRows, targetUserId)
      return targetPlace
        ? { ...group, shareRows: insertShareNextTo(group.shareRows, userId, targetPlace, edge) }
        : group
    })
  }

  function unpinShare(userId: string, openingPlacement: MiniplayerScreenPlacement) {
    keepGroupSharesWhere((sharedUserId) => sharedUserId !== userId)
    groups.value = [
      ...groups.value,
      { id: crypto.randomUUID(), shareRows: [[userId]], openingPlacement },
    ]
  }

  function closeGroup(groupId: string) {
    groups.value = groups.value.filter((group) => group.id !== groupId)
  }

  function keepOnlyShares(availableUserIds: string[]) {
    const availableUserIdSet = new Set(availableUserIds)
    if (miniplayerUserIds.value.every((userId) => availableUserIdSet.has(userId))) {
      return
    }
    keepGroupSharesWhere((userId) => availableUserIdSet.has(userId))
  }

  function startDragging(userId: string) {
    draggedUserId.value = userId
  }

  function showDropTarget(nextDropTarget: MiniplayerDropTarget | undefined) {
    const isSameTarget =
      nextDropTarget?.userId === dropTarget.value?.userId &&
      nextDropTarget?.edge === dropTarget.value?.edge
    if (!isSameTarget) {
      dropTarget.value = nextDropTarget
    }
  }

  function showDragGhost(nextDragGhost: MiniplayerDragGhost) {
    dragGhost.value = nextDragGhost
  }

  function stopDragging() {
    draggedUserId.value = undefined
    dropTarget.value = undefined
    dragGhost.value = undefined
  }

  function close() {
    groups.value = []
    stopDragging()
  }

  return {
    groups,
    draggedUserId,
    dropTarget,
    dragGhost,
    miniplayerUserIds,
    isOpen,
    containsShare,
    showShares,
    returnShare,
    moveShare,
    unpinShare,
    closeGroup,
    keepOnlyShares,
    startDragging,
    showDropTarget,
    showDragGhost,
    stopDragging,
    close,
  }
})
