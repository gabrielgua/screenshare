export interface MiniplayerContentSize {
  width: number
  height: number
}

const PANEL_PADDING_PIXELS = 4
const TILE_PADDING_PIXELS = 4

function measureRowHeight(rowAspectRatios: number[], contentWidth: number): number {
  const tileWidth = (contentWidth - PANEL_PADDING_PIXELS * 2) / rowAspectRatios.length
  const videoWidth = tileWidth - TILE_PADDING_PIXELS * 2
  const tallestVideoHeight = Math.max(
    ...rowAspectRatios.map((aspectRatio) => videoWidth / aspectRatio),
  )
  return tallestVideoHeight + TILE_PADDING_PIXELS * 2
}

export function fitMiniplayerContent(
  rowsOfAspectRatios: number[][],
  preferredWidth: number,
  maximumHeight: number,
): MiniplayerContentSize {
  const fittedHeight =
    rowsOfAspectRatios.reduce(
      (totalHeight, rowAspectRatios) =>
        totalHeight + measureRowHeight(rowAspectRatios, preferredWidth),
      0,
    ) +
    PANEL_PADDING_PIXELS * 2
  if (fittedHeight <= maximumHeight) {
    return { width: preferredWidth, height: fittedHeight }
  }
  const shrinkFactor = maximumHeight / fittedHeight
  return { width: preferredWidth * shrinkFactor, height: maximumHeight }
}
