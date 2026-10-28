import { ref, type Ref } from 'vue'
import type { MiniplayerDropEdge } from '@/stores/miniplayer-store'

export interface MiniplayerDropTarget {
  userId: string
  edge: MiniplayerDropEdge
}

interface PendingTileDrag {
  userId: string
  element: HTMLElement
  startX: number
  startY: number
}

interface TileBox {
  userId: string
  box: DOMRect
}

const DRAG_START_DISTANCE_PIXELS = 5
const DRAGGED_TILE_SCALE = 1.04
const TILE_SELECTOR = '[data-miniplayer-user-id]'
const NON_DRAGGING_TARGET_SELECTOR = 'button, input'

function measureDistanceToBox(pointerX: number, pointerY: number, box: DOMRect): number {
  const horizontalDistance = Math.max(box.left - pointerX, 0, pointerX - box.right)
  const verticalDistance = Math.max(box.top - pointerY, 0, pointerY - box.bottom)
  return Math.hypot(horizontalDistance, verticalDistance)
}

function findClosestEdge(pointerX: number, pointerY: number, box: DOMRect): MiniplayerDropEdge {
  const horizontalPosition = Math.min(Math.max((pointerX - box.left) / box.width, 0), 1)
  const verticalPosition = Math.min(Math.max((pointerY - box.top) / box.height, 0), 1)
  const distanceByEdge: Record<MiniplayerDropEdge, number> = {
    left: horizontalPosition,
    right: 1 - horizontalPosition,
    top: verticalPosition,
    bottom: 1 - verticalPosition,
  }
  const edges: MiniplayerDropEdge[] = ['left', 'right', 'top', 'bottom']
  return edges.reduce((closestEdge, edge) =>
    distanceByEdge[edge] < distanceByEdge[closestEdge] ? edge : closestEdge,
  )
}

export function useMiniplayerTileDragging(
  panelElement: Ref<HTMLElement | undefined>,
  onTileDropped: (userId: string, dropTarget: MiniplayerDropTarget) => void,
) {
  const draggedUserId = ref<string>()
  const dropTarget = ref<MiniplayerDropTarget>()
  let pendingTileDrag: PendingTileDrag | undefined

  function readOtherTileBoxes(userId: string): TileBox[] {
    const tileElements = panelElement.value?.querySelectorAll<HTMLElement>(TILE_SELECTOR) ?? []
    return [...tileElements]
      .filter((tileElement) => tileElement.dataset.miniplayerUserId !== userId)
      .map((tileElement) => ({
        userId: tileElement.dataset.miniplayerUserId ?? '',
        box: tileElement.getBoundingClientRect(),
      }))
  }

  function findDropTarget(
    userId: string,
    pointerX: number,
    pointerY: number,
  ): MiniplayerDropTarget | undefined {
    const closestTile = readOtherTileBoxes(userId).reduce<TileBox | undefined>(
      (closestSoFar, tileBox) =>
        !closestSoFar ||
        measureDistanceToBox(pointerX, pointerY, tileBox.box) <
          measureDistanceToBox(pointerX, pointerY, closestSoFar.box)
          ? tileBox
          : closestSoFar,
      undefined,
    )
    if (!closestTile) {
      return undefined
    }
    return {
      userId: closestTile.userId,
      edge: findClosestEdge(pointerX, pointerY, closestTile.box),
    }
  }

  function finishDragging(shouldDrop: boolean) {
    if (!pendingTileDrag) {
      return
    }
    const { userId, element } = pendingTileDrag
    const finalDropTarget = draggedUserId.value ? dropTarget.value : undefined
    pendingTileDrag = undefined
    draggedUserId.value = undefined
    dropTarget.value = undefined
    element.style.transform = ''
    if (shouldDrop && finalDropTarget) {
      onTileDropped(userId, finalDropTarget)
    }
  }

  function handleTilePointerDown(userId: string, pointerEvent: PointerEvent) {
    const pressedElement = pointerEvent.target
    if (
      pointerEvent.button !== 0 ||
      (pressedElement instanceof Element && pressedElement.closest(NON_DRAGGING_TARGET_SELECTOR))
    ) {
      return
    }
    const element = pointerEvent.currentTarget as HTMLElement
    pendingTileDrag = {
      userId,
      element,
      startX: pointerEvent.clientX,
      startY: pointerEvent.clientY,
    }
    element.setPointerCapture(pointerEvent.pointerId)
  }

  function handleTilePointerMove(pointerEvent: PointerEvent) {
    if (!pendingTileDrag) {
      return
    }
    const horizontalOffset = pointerEvent.clientX - pendingTileDrag.startX
    const verticalOffset = pointerEvent.clientY - pendingTileDrag.startY
    if (
      !draggedUserId.value &&
      Math.hypot(horizontalOffset, verticalOffset) < DRAG_START_DISTANCE_PIXELS
    ) {
      return
    }
    draggedUserId.value = pendingTileDrag.userId
    pendingTileDrag.element.style.transform = `translate(${horizontalOffset}px, ${verticalOffset}px) scale(${DRAGGED_TILE_SCALE})`
    dropTarget.value = findDropTarget(
      pendingTileDrag.userId,
      pointerEvent.clientX,
      pointerEvent.clientY,
    )
  }

  function handleTilePointerUp() {
    finishDragging(true)
  }

  function handleTilePointerCancel() {
    finishDragging(false)
  }

  return {
    draggedUserId,
    dropTarget,
    handleTilePointerDown,
    handleTilePointerMove,
    handleTilePointerUp,
    handleTilePointerCancel,
  }
}
