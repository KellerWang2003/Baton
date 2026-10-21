import { toLocal } from '../app/localPoint'

export const MENU_WIDTH = 230
const MENU_GAP = 14
const EDGE = 16

export type PhotoMenuLayout = ReturnType<typeof placePhotoMenu>

// Where the photo starts (over the real one) and lifts to, and where the menu
// goes: under the photo, or above it when there's no room below, kept on
// screen. `from` is the photo on screen; `page` the positioned element the
// menu covers, in whose points it's all placed; `items` how many rows
export function placePhotoMenu(from: DOMRect, page: HTMLElement, items: number) {
  const local = toLocal(page)
  const topLeft = local({ x: from.left, y: from.top })
  const bottomRight = local({ x: from.right, y: from.bottom })
  const start = { x: topLeft.x, y: topLeft.y, size: bottomRight.x - topLeft.x }
  const width = page.clientWidth
  const height = page.clientHeight
  const menuHeight = items * 44
  // A little bigger than in the cloud, and never tiny
  const size = Math.min(width - EDGE * 2, Math.max(start.size * 1.25, 150))
  const centerX = start.x + start.size / 2
  const centerY = start.y + start.size / 2
  const x = Math.min(width - EDGE - size, Math.max(EDGE, centerX - size / 2))
  const top = 60
  const bottom = height - 40
  let y = centerY - size / 2
  const below = y + size + MENU_GAP + menuHeight <= bottom
  if (!below && y - MENU_GAP - menuHeight < top) y = bottom - menuHeight - MENU_GAP - size
  y = Math.max(top, Math.min(bottom - size, y))
  const menuBelow = y + size + MENU_GAP + menuHeight <= bottom
  const menuX = Math.min(width - EDGE - MENU_WIDTH, Math.max(EDGE, x + size / 2 - MENU_WIDTH / 2))
  const menuY = menuBelow ? y + size + MENU_GAP : y - MENU_GAP - menuHeight
  const originX = `${Math.round(x + size / 2 - menuX)}px`
  return {
    start,
    end: { x, y, size },
    menu: { x: menuX, y: menuY, origin: `${originX} ${menuBelow ? 'top' : 'bottom'}` },
  }
}
