export interface MiniplayerContentSize {
  width: number
  height: number
}

export const MINIPLAYER_HEADER_HEIGHT_PIXELS = 32

export function countMiniplayerColumns<RowItem>(rows: RowItem[][]): number {
  return Math.max(1, ...rows.map((row) => row.length))
}

export function measureTileWidth(contentWidth: number, columnCount: number): number {
  return contentWidth / Math.max(1, columnCount)
}

function measureRowHeight(rowAspectRatios: number[], tileWidth: number): number {
  return Math.max(...rowAspectRatios.map((aspectRatio) => tileWidth / aspectRatio))
}

export function fitMiniplayerContent(
  rowsOfAspectRatios: number[][],
  tileWidth: number,
  maximumSize: MiniplayerContentSize,
): MiniplayerContentSize {
  const columnCount = countMiniplayerColumns(rowsOfAspectRatios)
  const sharesWidth = tileWidth * columnCount
  const sharesHeight = rowsOfAspectRatios.reduce(
    (totalHeight, rowAspectRatios) => totalHeight + measureRowHeight(rowAspectRatios, tileWidth),
    0,
  )
  const shrinkFactor = Math.min(
    1,
    maximumSize.width / sharesWidth,
    (maximumSize.height - MINIPLAYER_HEADER_HEIGHT_PIXELS) / sharesHeight,
  )
  return {
    width: sharesWidth * shrinkFactor,
    height: sharesHeight * shrinkFactor + MINIPLAYER_HEADER_HEIGHT_PIXELS,
  }
}
