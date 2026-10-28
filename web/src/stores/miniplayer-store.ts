import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type MiniplayerDropEdge = 'left' | 'right' | 'top' | 'bottom'

interface SharePlace {
  rowIndex: number
  columnIndex: number
}

export const useMiniplayerStore = defineStore('miniplayer', () => {
  const shareRows = ref<string[][]>([])

  const miniplayerUserIds = computed(() => shareRows.value.flat())
  const isOpen = computed(() => miniplayerUserIds.value.length > 0)

  function containsShare(userId: string): boolean {
    return miniplayerUserIds.value.includes(userId)
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

  function withoutShare(rows: string[][], userId: string): string[][] {
    return rows
      .map((row) => row.filter((rowUserId) => rowUserId !== userId))
      .filter((row) => row.length > 0)
  }

  function showShares(userIds: string[]) {
    const addedRows = userIds.filter((userId) => !containsShare(userId)).map((userId) => [userId])
    shareRows.value = [...shareRows.value, ...addedRows]
  }

  function returnShare(userId: string) {
    shareRows.value = withoutShare(shareRows.value, userId)
  }

  function moveShare(userId: string, targetUserId: string, edge: MiniplayerDropEdge) {
    if (userId === targetUserId) {
      return
    }
    const remainingRows = withoutShare(shareRows.value, userId)
    const targetPlace = findSharePlace(remainingRows, targetUserId)
    if (!targetPlace) {
      return
    }
    const rearrangedRows = remainingRows.map((row) => [...row])
    if (edge === 'left' || edge === 'right') {
      const insertIndex = targetPlace.columnIndex + (edge === 'right' ? 1 : 0)
      rearrangedRows[targetPlace.rowIndex]?.splice(insertIndex, 0, userId)
    } else {
      const insertIndex = targetPlace.rowIndex + (edge === 'bottom' ? 1 : 0)
      rearrangedRows.splice(insertIndex, 0, [userId])
    }
    shareRows.value = rearrangedRows
  }

  function keepOnlyShares(availableUserIds: string[]) {
    const availableUserIdSet = new Set(availableUserIds)
    const keptRows = shareRows.value
      .map((row) => row.filter((userId) => availableUserIdSet.has(userId)))
      .filter((row) => row.length > 0)
    if (keptRows.flat().length !== miniplayerUserIds.value.length) {
      shareRows.value = keptRows
    }
  }

  function close() {
    shareRows.value = []
  }

  return {
    shareRows,
    miniplayerUserIds,
    isOpen,
    containsShare,
    showShares,
    returnShare,
    moveShare,
    keepOnlyShares,
    close,
  }
})
