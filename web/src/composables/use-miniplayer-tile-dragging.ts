import type { Ref } from 'vue'
import {
  containsPoint,
  expandBox,
  findClosestEdge,
  findNearestTile,
  measureDistanceToBox,
  moveBox,
  readContentScreenBox,
  readTileBoxes,
  type ScreenBox,
  type ScreenPoint,
} from '@/media/miniplayer-geometry'
import { MINIPLAYER_HEADER_HEIGHT_PIXELS } from '@/media/miniplayer-layout'
import { canSeparateMiniplayers, moveFloatingWindowBy } from '@/media/miniplayer-window'
import {
  findTargetForWindowBox,
  PIN_DISTANCE_PIXELS,
  readOtherWindowTiles,
} from '@/media/miniplayer-drop-targets'
import { useMiniplayerStore, type MiniplayerDropTarget } from '@/stores/miniplayer-store'

interface PendingTileDrag {
  userId: string
  element: HTMLElement
  view: Window
  startPointer: ScreenPoint
  sentWindowOffset: ScreenPoint
  startContentBox: ScreenBox
  pointerOffsetFromTileCenter: ScreenPoint
  isMovingWindow: boolean
  hasStarted: boolean
}

const DRAG_START_DISTANCE_PIXELS = 5
const DETACH_DISTANCE_PIXELS = 48
const NON_DRAGGING_TARGET_SELECTOR = 'button, input'

export function useMiniplayerTileDragging(
  panelElement: Ref<HTMLElement | undefined>,
  readGroupId: () => string,
  isAloneInWindow: () => boolean,
) {
  const miniplayerStore = useMiniplayerStore()
  let isDetaching = false
  let pendingTileDrag: PendingTileDrag | undefined

  function findTargetInsideWindow(
    userId: string,
    pointerEvent: PointerEvent,
  ): MiniplayerDropTarget | undefined {
    const clientPoint = { x: pointerEvent.clientX, y: pointerEvent.clientY }
    const ownTiles = panelElement.value ? readTileBoxes(panelElement.value, userId) : []
    const nearestTile = findNearestTile(ownTiles, (box) => measureDistanceToBox(clientPoint, box))
    return (
      nearestTile && {
        userId: nearestTile.userId,
        edge: findClosestEdge(clientPoint, nearestTile.box),
      }
    )
  }

  function findTargetInOtherWindows(
    userId: string,
    pointer: ScreenPoint,
  ): MiniplayerDropTarget | undefined {
    const nearestTile = findNearestTile(
      readOtherWindowTiles(readGroupId(), userId),
      (box) => measureDistanceToBox(pointer, box),
      PIN_DISTANCE_PIXELS,
    )
    return (
      nearestTile && { userId: nearestTile.userId, edge: findClosestEdge(pointer, nearestTile.box) }
    )
  }

  function dragTileInsideWindow(drag: PendingTileDrag, pointerEvent: PointerEvent) {
    const pointer = { x: pointerEvent.screenX, y: pointerEvent.screenY }
    followPointer(drag, pointer)
    const windowArea = {
      left: 0,
      top: 0,
      right: drag.view.innerWidth,
      bottom: drag.view.innerHeight,
    }
    const clientPoint = { x: pointerEvent.clientX, y: pointerEvent.clientY }
    if (containsPoint(expandBox(windowArea, DETACH_DISTANCE_PIXELS), clientPoint)) {
      isDetaching = false
      miniplayerStore.showDropTarget(findTargetInsideWindow(drag.userId, pointerEvent))
      return
    }
    const targetInOtherWindow = findTargetInOtherWindows(drag.userId, pointer)
    isDetaching = !targetInOtherWindow && canSeparateMiniplayers()
    miniplayerStore.showDropTarget(targetInOtherWindow)
  }

  function followPointer(drag: PendingTileDrag, pointer: ScreenPoint) {
    if (canSeparateMiniplayers()) {
      miniplayerStore.showDragGhost({
        userId: drag.userId,
        left: pointer.x - drag.element.offsetWidth / 2,
        top: pointer.y - drag.element.offsetHeight / 2,
        width: drag.element.offsetWidth,
        height: drag.element.offsetHeight,
      })
      return
    }
    const horizontalOffset = pointer.x - drag.startPointer.x + drag.pointerOffsetFromTileCenter.x
    const verticalOffset = pointer.y - drag.startPointer.y + drag.pointerOffsetFromTileCenter.y
    drag.element.style.transform = `translate(${horizontalOffset}px, ${verticalOffset}px)`
  }

  function moveWholeWindow(drag: PendingTileDrag, pointerEvent: PointerEvent) {
    const horizontalOffset = pointerEvent.screenX - drag.startPointer.x
    const verticalOffset = pointerEvent.screenY - drag.startPointer.y
    const windowOffset = { x: Math.round(horizontalOffset), y: Math.round(verticalOffset) }
    const unsentOffset = {
      x: windowOffset.x - drag.sentWindowOffset.x,
      y: windowOffset.y - drag.sentWindowOffset.y,
    }
    if (unsentOffset.x !== 0 || unsentOffset.y !== 0) {
      drag.sentWindowOffset = windowOffset
      moveFloatingWindowBy(drag.view, readGroupId(), unsentOffset)
    }
    const movedContentBox = moveBox(drag.startContentBox, horizontalOffset, verticalOffset)
    miniplayerStore.showDropTarget(
      findTargetForWindowBox(readGroupId(), drag.userId, movedContentBox),
    )
  }

  function finishDragging(shouldDrop: boolean, pointerEvent: PointerEvent) {
    const drag = pendingTileDrag
    if (!drag) {
      return
    }
    const finalDropTarget = drag.hasStarted ? miniplayerStore.dropTarget : undefined
    const shouldDetach = drag.hasStarted && isDetaching
    pendingTileDrag = undefined
    isDetaching = false
    drag.element.style.transform = ''
    miniplayerStore.stopDragging()
    if (!shouldDrop) {
      return
    }
    if (finalDropTarget) {
      miniplayerStore.moveShare(drag.userId, finalDropTarget.userId, finalDropTarget.edge)
      return
    }
    if (shouldDetach) {
      miniplayerStore.unpinShare(drag.userId, {
        left: pointerEvent.screenX - drag.element.offsetWidth / 2,
        top: pointerEvent.screenY - drag.element.offsetHeight / 2 - MINIPLAYER_HEADER_HEIGHT_PIXELS,
        tileWidth: drag.element.offsetWidth,
      })
    }
  }

  function handleTilePointerDown(userId: string, pointerEvent: PointerEvent) {
    const pressedElement = pointerEvent.target
    const view = panelElement.value?.ownerDocument.defaultView
    if (
      !view ||
      pointerEvent.button !== 0 ||
      (pressedElement instanceof Element && pressedElement.closest(NON_DRAGGING_TARGET_SELECTOR))
    ) {
      return
    }
    const element = pointerEvent.currentTarget as HTMLElement
    const tileBox = element.getBoundingClientRect()
    pendingTileDrag = {
      userId,
      element,
      view,
      startPointer: { x: pointerEvent.screenX, y: pointerEvent.screenY },
      sentWindowOffset: { x: 0, y: 0 },
      startContentBox: readContentScreenBox(view),
      pointerOffsetFromTileCenter: {
        x: pointerEvent.clientX - (tileBox.left + tileBox.width / 2),
        y: pointerEvent.clientY - (tileBox.top + tileBox.height / 2),
      },
      isMovingWindow: isAloneInWindow(),
      hasStarted: false,
    }
    element.setPointerCapture(pointerEvent.pointerId)
  }

  function handleTilePointerMove(pointerEvent: PointerEvent) {
    const drag = pendingTileDrag
    if (!drag) {
      return
    }
    const travelledDistance = Math.hypot(
      pointerEvent.screenX - drag.startPointer.x,
      pointerEvent.screenY - drag.startPointer.y,
    )
    if (!drag.hasStarted && travelledDistance < DRAG_START_DISTANCE_PIXELS) {
      return
    }
    if (!drag.hasStarted) {
      drag.hasStarted = true
      miniplayerStore.startDragging(drag.userId)
    }
    if (drag.isMovingWindow) {
      moveWholeWindow(drag, pointerEvent)
      return
    }
    dragTileInsideWindow(drag, pointerEvent)
  }

  function handleTilePointerUp(pointerEvent: PointerEvent) {
    finishDragging(true, pointerEvent)
  }

  function handleTilePointerCancel(pointerEvent: PointerEvent) {
    finishDragging(false, pointerEvent)
  }

  return {
    handleTilePointerDown,
    handleTilePointerMove,
    handleTilePointerUp,
    handleTilePointerCancel,
  }
}
