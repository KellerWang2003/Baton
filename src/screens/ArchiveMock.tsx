import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { navigate } from '../app/navigate'
import { StatusBar } from '../app/StatusBar'
import { useStatus } from '../app/store'
import { useScreenIndex } from '../app/useScreenIndex'
import { flow } from '../flow'
import { Archive } from './Archive'
import { ArchiveDetail } from './ArchiveDetail'
import { ArchiveSelected } from './ArchiveSelected'
import { TabShell } from './MainLayout'

// The screens the phone can show; anything else goes back to Archive
const SCREENS = ['archive', 'archive-detail', 'archive-selected']

// The picture is drawn on a 1080pt square and scaled to fit the window
const CANVAS = 1080
// The phone bezel art (same as the prototype frame): 1406x2822 at 3x, its
// screen starting at (102, 100) and 1206x2622
const PHONE = { width: 1406 / 3, height: 2822 / 3 }
// The phone's body inside that art (measured from its opaque pixels), and how
// thick it is: the side is drawn as a stack of body outlines going back
const BODY = { left: 59 / 3, top: 56 / 3, width: (1350 - 59 + 1) / 3, height: (2765 - 56 + 1) / 3, radius: 77 }
const DEPTH = 36
const LAYERS = 24
// Fitted to the Umi shot: each edge's angle and length on screen, with the
// phone's side showing on the right and bottom
const TILT = 'rotateZ(19deg) rotateX(20deg) rotateY(-24deg) scale(1.2)'

// Team-only page (?3d-proto, or Debug > 3D proto): a one-off shot of
// Archive in a phone tilted back and turned, after the Umi launch mock. The
// phone runs the real Archive, its city page and an opened photo, following
// the URL like the prototype (the prototype itself is hidden meanwhile); the
// tab bar does nothing, so it stays in Archive.
// The page color follows Debug > Background (white when it's reset).
export function ArchiveMock({ onClose, backgroundColor }: { onClose: () => void; backgroundColor: string | null }) {
  const status = useStatus()
  const [index] = useScreenIndex()
  const id = flow[index].id
  const shown = SCREENS.includes(id) ? id : 'archive'
  useEffect(() => {
    if (!SCREENS.includes(id)) navigate('archive')
  }, [id])
  const page = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const element = page.current
    if (!element) return
    const fit = () => setScale(Math.min(element.clientWidth, element.clientHeight) / CANVAS)
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={page} style={{ backgroundColor: backgroundColor ?? undefined }} className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-white">
      <div style={{ width: CANVAS, height: CANVAS, transform: `scale(${scale})`, flexShrink: 0 }} className="relative flex items-center justify-center [perspective:2600px]">
        {/* The side of the phone, so it has depth like a real one. It has its
            own 3D layer: kept apart from the screen, the live pages inside stay
            flat and Chrome never sorts them behind one another */}
        <div style={{ ...PHONE, transform: TILT }} className="pointer-events-none absolute [transform-style:preserve-3d]">
          {Array.from({ length: LAYERS }, (_, i) => {
            const back = (i + 1) / LAYERS
            return (
              <div
                key={i}
                aria-hidden
                style={{
                  ...BODY,
                  position: 'absolute',
                  borderRadius: BODY.radius,
                  transform: `translateZ(${-back * DEPTH}px)`,
                  background: `color-mix(in srgb, var(--color-device-rim) ${Math.round((1 - back) * 100)}%, var(--color-device-edge))`,
                }}
              />
            )
          })}
        </div>
        {/* The front: screen and bezel, at the same tilt */}
        <div style={{ ...PHONE, transform: TILT }} className="absolute">
          <div
            data-stage={status}
            className="absolute flex flex-col overflow-hidden rounded-[64px] bg-baton-paper"
            style={{ left: `${(102 / 1406) * 100}%`, top: `${(100 / 2822) * 100}%`, width: `${(1206 / 1406) * 100}%`, height: `${(2622 / 2822) * 100}%` }}
          >
            <StatusBar showIsland={false} />
            <div className="@container relative min-h-0 flex-1" style={{ '--status-bar': '54px' } as CSSProperties}>
              {shown === 'archive' && (
                <>
                  <TabShell activeTab="archive">
                    <Archive />
                  </TabShell>
                  {/* Catches taps on the tab bar so it stays in Archive */}
                  <div aria-hidden className="absolute inset-x-12 bottom-4 z-50 h-[84px]" />
                </>
              )}
              {shown === 'archive-detail' && <ArchiveDetail />}
              {shown === 'archive-selected' && <ArchiveSelected />}
            </div>
          </div>
          <img src="/device/iphone-16-pro-black.png" alt="" aria-hidden draggable={false} className="pointer-events-none absolute inset-0 h-full w-full select-none" />
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full bg-baton-navy px-4 py-2 text-subhead font-medium text-on-brand opacity-0 transition-opacity hover:opacity-90 focus-visible:opacity-90"
      >
        Close
      </button>
    </div>
  )
}
