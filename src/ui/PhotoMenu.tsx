import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cx } from './cx'
import { ExpandIcon, TrashIcon } from './icons'
import { MENU_WIDTH, type PhotoMenuLayout } from './photoMenuLayout'

type PhotoMenuProps = {
  // The photo pressed, and where it and the menu go (placePhotoMenu)
  src: string
  layout: PhotoMenuLayout
  // Open is left out for photos with nothing behind them
  onOpen?: () => void
  onDelete: () => void
  // After the menu has animated away; the photo can show in the cloud again
  onClose: () => void
}

const LIFT = { duration: 380, easing: 'cubic-bezier(0.25, 1.3, 0.4, 1)', fill: 'forwards' } as const
const DROP = { duration: 240, easing: 'cubic-bezier(0.4, 0, 0.6, 1)', fill: 'forwards' } as const

// An iOS-style context menu for a photo in the Archive cloud, opened by a
// long press: the page blurs behind, the photo lifts out of the cloud,
// growing a little, and the menu springs out of it (Open, and Delete in red).
// Tapping anywhere else puts it back. The photo is a copy; the cloud hides
// the real one meanwhile.
export function PhotoMenu({ src, layout, onOpen, onDelete, onClose }: PhotoMenuProps) {
  const photoRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  // The finger that opened it is still down: taps count only once it lifts,
  // so letting go doesn't close the menu straight away
  const [ready, setReady] = useState(false)
  const leaving = useRef(false)

  useEffect(() => {
    const lift = () => setTimeout(() => setReady(true))
    window.addEventListener('pointerup', lift, { once: true })
    window.addEventListener('pointercancel', lift, { once: true })
    return () => {
      window.removeEventListener('pointerup', lift)
      window.removeEventListener('pointercancel', lift)
    }
  }, [])

  useLayoutEffect(() => {
    const { start, end } = layout
    photoRef.current?.animate(
      [
        { left: `${start.x}px`, top: `${start.y}px`, width: `${start.size}px`, height: `${start.size}px`, boxShadow: '0 0 0 rgb(0 0 0 / 0)' },
        { left: `${end.x}px`, top: `${end.y}px`, width: `${end.size}px`, height: `${end.size}px`, boxShadow: '0 16px 40px rgb(0 0 0 / 0.22)' },
      ],
      LIFT,
    )
    menuRef.current?.animate([{ opacity: 0, transform: 'scale(0.4)' }, { opacity: 1, transform: 'scale(1)' }], { ...LIFT, delay: 40 })
    backdropRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, fill: 'forwards' })
  }, [layout])

  // Back into the cloud (close), or shrinking away (delete)
  function leave(deleting: boolean) {
    if (leaving.current) return
    leaving.current = true
    const { start, end } = layout
    photoRef.current?.animate(
      deleting
        ? [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.2)' },
          ]
        : [
            { left: `${end.x}px`, top: `${end.y}px`, width: `${end.size}px`, height: `${end.size}px`, boxShadow: '0 16px 40px rgb(0 0 0 / 0.22)' },
            { left: `${start.x}px`, top: `${start.y}px`, width: `${start.size}px`, height: `${start.size}px`, boxShadow: '0 0 0 rgb(0 0 0 / 0)' },
          ],
      DROP,
    )
    menuRef.current?.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.6)' }], DROP)
    backdropRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], DROP)
    if (deleting) onDelete()
    // On a timer rather than the animation's end, which a hidden tab holds back
    setTimeout(onClose, DROP.duration)
  }

  return (
    <div className={cx('absolute inset-0 z-40 select-none', !ready && 'pointer-events-none')} onClick={() => leave(false)}>
      {/* Up under the status bar, like the cloud */}
      <div
        ref={backdropRef}
        aria-hidden
        style={{ top: 'calc(-1 * var(--status-bar, 0px))' }}
        className="absolute inset-x-0 bottom-0 bg-ink/10 opacity-0 backdrop-blur-md"
      />
      <div ref={photoRef} className="absolute overflow-hidden rounded-full" onClick={(event) => event.stopPropagation()}>
        <img src={src} alt="" draggable={false} className="size-full object-cover" />
      </div>
      <div
        ref={menuRef}
        role="menu"
        style={{ left: `${layout.menu.x}px`, top: `${layout.menu.y}px`, width: `${MENU_WIDTH}px`, transformOrigin: layout.menu.origin }}
        className="absolute overflow-hidden rounded-[14px] bg-glass opacity-0 shadow-float backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {onOpen && (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              leaving.current = true
              onOpen()
            }}
            className="flex h-11 w-full items-center justify-between border-b border-line px-4 text-body text-ink active:bg-ink/5"
          >
            Open
            <ExpandIcon />
          </button>
        )}
        <button
          type="button"
          role="menuitem"
          onClick={() => leave(true)}
          className="flex h-11 w-full items-center justify-between px-4 text-body text-danger active:bg-ink/5"
        >
          Delete
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}
