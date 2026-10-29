import type { MiniplayerDropTarget } from '@/stores/miniplayer-store'
import {
  findFacingEdge,
  findNearestTile,
  measureDistanceBetweenBoxes,
  readTileScreenBoxes,
  type MiniplayerTileBox,
  type ScreenBox,
} from './miniplayer-geometry'
import { listOtherMiniplayerViews } from './miniplayer-window-registry'

export const PIN_DISTANCE_PIXELS = 56

export function readOtherWindowTiles(groupId: string, excludedUserId: string): MiniplayerTileBox[] {
  return listOtherMiniplayerViews(groupId).flatMap((view) =>
    readTileScreenBoxes(view, excludedUserId),
  )
}

export function findTargetForWindowBox(
  groupId: string,
  userId: string,
  windowContentBox: ScreenBox,
): MiniplayerDropTarget | undefined {
  const nearestTile = findNearestTile(
    readOtherWindowTiles(groupId, userId),
    (box) => measureDistanceBetweenBoxes(windowContentBox, box),
    PIN_DISTANCE_PIXELS,
  )
  return (
    nearestTile && {
      userId: nearestTile.userId,
      edge: findFacingEdge(windowContentBox, nearestTile.box),
    }
  )
}
