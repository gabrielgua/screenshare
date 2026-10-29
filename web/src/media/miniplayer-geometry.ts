import type { MiniplayerDropEdge } from '@/stores/miniplayer-store'

export interface ScreenPoint {
  x: number
  y: number
}

export interface ScreenBox {
  left: number
  top: number
  right: number
  bottom: number
}

export interface MiniplayerTileBox {
  userId: string
  box: ScreenBox
}

export const MINIPLAYER_TILE_SELECTOR = '[data-miniplayer-user-id]'

const DROP_EDGES: MiniplayerDropEdge[] = ['left', 'right', 'top', 'bottom']

function readBoxWidth(box: ScreenBox): number {
  return box.right - box.left
}

function readBoxHeight(box: ScreenBox): number {
  return box.bottom - box.top
}

export function measureDistanceToBox(point: ScreenPoint, box: ScreenBox): number {
  const horizontalDistance = Math.max(box.left - point.x, 0, point.x - box.right)
  const verticalDistance = Math.max(box.top - point.y, 0, point.y - box.bottom)
  return Math.hypot(horizontalDistance, verticalDistance)
}

export function measureDistanceBetweenBoxes(firstBox: ScreenBox, secondBox: ScreenBox): number {
  const horizontalGap = Math.max(
    secondBox.left - firstBox.right,
    0,
    firstBox.left - secondBox.right,
  )
  const verticalGap = Math.max(secondBox.top - firstBox.bottom, 0, firstBox.top - secondBox.bottom)
  return Math.hypot(horizontalGap, verticalGap)
}

export function expandBox(box: ScreenBox, distance: number): ScreenBox {
  return {
    left: box.left - distance,
    top: box.top - distance,
    right: box.right + distance,
    bottom: box.bottom + distance,
  }
}

export function moveBox(
  box: ScreenBox,
  horizontalOffset: number,
  verticalOffset: number,
): ScreenBox {
  return {
    left: box.left + horizontalOffset,
    top: box.top + verticalOffset,
    right: box.right + horizontalOffset,
    bottom: box.bottom + verticalOffset,
  }
}

export function containsPoint(box: ScreenBox, point: ScreenPoint): boolean {
  return point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom
}

export function findClosestEdge(point: ScreenPoint, box: ScreenBox): MiniplayerDropEdge {
  const horizontalPosition = Math.min(Math.max((point.x - box.left) / readBoxWidth(box), 0), 1)
  const verticalPosition = Math.min(Math.max((point.y - box.top) / readBoxHeight(box), 0), 1)
  const distanceByEdge: Record<MiniplayerDropEdge, number> = {
    left: horizontalPosition,
    right: 1 - horizontalPosition,
    top: verticalPosition,
    bottom: 1 - verticalPosition,
  }
  return DROP_EDGES.reduce((closestEdge, edge) =>
    distanceByEdge[edge] < distanceByEdge[closestEdge] ? edge : closestEdge,
  )
}

export function findFacingEdge(draggedBox: ScreenBox, targetBox: ScreenBox): MiniplayerDropEdge {
  const horizontalOffset =
    (draggedBox.left + draggedBox.right - targetBox.left - targetBox.right) /
    (readBoxWidth(draggedBox) + readBoxWidth(targetBox))
  const verticalOffset =
    (draggedBox.top + draggedBox.bottom - targetBox.top - targetBox.bottom) /
    (readBoxHeight(draggedBox) + readBoxHeight(targetBox))
  if (Math.abs(horizontalOffset) > Math.abs(verticalOffset)) {
    return horizontalOffset < 0 ? 'left' : 'right'
  }
  return verticalOffset < 0 ? 'top' : 'bottom'
}

export function findNearestTile(
  tileBoxes: MiniplayerTileBox[],
  measureDistance: (box: ScreenBox) => number,
  maximumDistance = Number.POSITIVE_INFINITY,
): MiniplayerTileBox | undefined {
  let nearestTile: MiniplayerTileBox | undefined
  let nearestDistance = maximumDistance
  for (const tileBox of tileBoxes) {
    const distance = measureDistance(tileBox.box)
    if (distance <= nearestDistance) {
      nearestTile = tileBox
      nearestDistance = distance
    }
  }
  return nearestTile
}

export function readTileBoxes(container: ParentNode, excludedUserId: string): MiniplayerTileBox[] {
  return [...container.querySelectorAll<HTMLElement>(MINIPLAYER_TILE_SELECTOR)]
    .filter((tileElement) => tileElement.dataset.miniplayerUserId !== excludedUserId)
    .map((tileElement) => ({
      userId: tileElement.dataset.miniplayerUserId ?? '',
      box: tileElement.getBoundingClientRect(),
    }))
}

export function readContentScreenBoxAt(
  view: Window,
  outerLeft: number,
  outerTop: number,
): ScreenBox {
  const sideBorderWidth = (view.outerWidth - view.innerWidth) / 2
  const left = outerLeft + sideBorderWidth
  const top = outerTop + view.outerHeight - view.innerHeight - sideBorderWidth
  return { left, top, right: left + view.innerWidth, bottom: top + view.innerHeight }
}

export function readContentScreenBox(view: Window): ScreenBox {
  return readContentScreenBoxAt(view, view.screenX, view.screenY)
}

export function readTileScreenBoxes(view: Window, excludedUserId: string): MiniplayerTileBox[] {
  const contentBox = readContentScreenBox(view)
  return readTileBoxes(view.document, excludedUserId).map((tileBox) => ({
    userId: tileBox.userId,
    box: moveBox(tileBox.box, contentBox.left, contentBox.top),
  }))
}
