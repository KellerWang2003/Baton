import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

// Brand collage playground (team only: Debug > Brand collage, or ?collage).
// Every piece is the real prototype running in a small window (the app itself
// with ?embed, on the screen the motion lives on), so the motion is exactly the
// prototype's. Drag a piece to move it; Play replays each one on a loop.
// Taps and scrolls are scripted into the embedded app.

type Win = Window & typeof globalThis
const PANEL = 220
const PHONE = { w: 402, h: 874 }

type Piece = {
  id: string
  name: string
  hash: string
  x: number
  y: number
  // Window size on the canvas and the app's scale inside it
  w: number
  h: number
  scale: number
  // Which part of the 402x874 app shows (its top left, in app points)
  ox?: number
  oy?: number
  rounded?: boolean
  // Reload the app every loopMs on Play, so entrances play again
  loopMs?: number
  // Scripted taps and scrolls once the app has loaded; returns a cleanup
  script?: (win: Win) => () => void
}

const wait = (ms: number, fn: () => void) => {
  const id = window.setTimeout(fn, ms)
  return () => window.clearTimeout(id)
}

function pointer(win: Win, target: Element, type: string, x: number, y: number) {
  target.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, pointerType: 'touch', isPrimary: true, buttons: type === 'pointerup' ? 0 : 1 }))
}

function tap(win: Win, x: number, y: number) {
  const el = win.document.elementFromPoint(x, y)
  if (!el) return
  pointer(win, el, 'pointerdown', x, y)
  pointer(win, el, 'pointerup', x, y)
  el.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y }))
}

function scroller(win: Win) {
  let el: Element | null = win.document.elementFromPoint(PHONE.w / 2, PHONE.h / 2)
  while (el && !/(auto|scroll)/.test(win.getComputedStyle(el).overflowY)) el = el.parentElement
  return el
}

const pieces: Piece[] = [
  {
    // Today's blob: it morphs on its own; a scripted scroll and drag push it
    id: 'blob', name: "Today's blob", hash: '/today', x: 60, y: 30, w: 330, h: 330, scale: 0.9, ox: 10, oy: 110,
    script: (win) => {
      let stop: Array<() => void> = []
      const run = () => {
        const page = scroller(win)
        page?.scrollTo({ top: 50, behavior: 'smooth' })
        stop.push(wait(900, () => page?.scrollTo({ top: 0, behavior: 'smooth' })))
        const glass = win.document.querySelector('canvas')
        const r = glass?.getBoundingClientRect()
        if (glass && r) {
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2
          stop.push(wait(1800, () => pointer(win, glass, 'pointerdown', cx, cy)))
          for (let i = 1; i <= 8; i++) stop.push(wait(1800 + i * 60, () => pointer(win, glass, 'pointermove', cx + i * 7, cy - i * 5)))
          stop.push(wait(2500, () => pointer(win, glass, 'pointerup', cx + 56, cy - 40)))
        }
      }
      const first = wait(1500, run)
      const every = window.setInterval(() => { stop.forEach((s) => s()); stop = []; run() }, 4500)
      return () => { first(); window.clearInterval(every); stop.forEach((s) => s()) }
    },
  },
  {
    // Archive: the folder stack, focus moving down and back up by wheel
    id: 'archive', name: 'Scrolling in Archive', hash: '/archive', x: 440, y: 20, w: 250, h: 540, scale: 0.62, rounded: true,
    script: (win) => {
      const wheel = (dy: number) => {
        const el = win.document.elementFromPoint(PHONE.w / 2, PHONE.h / 2)
        el?.dispatchEvent(new win.WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: dy, clientX: PHONE.w / 2, clientY: PHONE.h / 2 }))
      }
      const steps = [300, 300, -300, -300]
      let i = 0
      const every = window.setInterval(() => { wheel(steps[i % steps.length]); i++ }, 1700)
      return () => window.clearInterval(every)
    },
  },
  {
    // Intentions: bubbles going from glass to picked blue, one by one
    id: 'bubbles', name: 'Intention bubbles', hash: '/intentions', x: 740, y: 20, w: 250, h: 540, scale: 0.62, rounded: true, loopMs: 8000,
    script: (win) => {
      const timers = [1800, 2800, 3800, 4800].map((d, i) => wait(d, () => {
        const mid = { x: PHONE.w / 2, y: PHONE.h / 2 }
        const bubbles = [...win.document.querySelectorAll('button[aria-pressed]')]
          .map((b) => ({ b, r: b.getBoundingClientRect() }))
          .filter(({ r }) => r.left > 0 && r.right < PHONE.w && r.top > 90 && r.bottom < PHONE.h - 90)
          .sort((a, b) => Math.hypot(a.r.left + a.r.width / 2 - mid.x, a.r.top + a.r.height / 2 - mid.y) - Math.hypot(b.r.left + b.r.width / 2 - mid.x, b.r.top + b.r.height / 2 - mid.y))
        const pick = bubbles[i]
        if (pick) tap(win, pick.r.left + pick.r.width / 2, pick.r.top + pick.r.height / 2)
      }))
      return () => timers.forEach((t) => t())
    },
  },
  {
    // Tap the prompt on Today: the circle opens into the camera or the field
    id: 'post', name: 'Tap to post', hash: '/today', x: 80, y: 410, w: 250, h: 540, scale: 0.62, rounded: true, loopMs: 7000,
    script: (win) => {
      const glass = () => win.document.querySelector('canvas')
      const close = [
        wait(1800, () => { const r = glass()?.getBoundingClientRect(); if (r) tap(win, r.left + r.width / 2, r.top + r.height / 2) }),
        wait(5000, () => win.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))),
      ]
      return () => close.forEach((c) => c())
    },
  },
  {
    id: 'paper', name: 'Rolling Paper', hash: '/rolling-paper', x: 740, y: 600, w: 250, h: 540, scale: 0.62, rounded: true, loopMs: 18000,
  },
  {
    // The LA folder sliding aside as the new one lands on top
    id: 'folders', name: 'Folders', hash: '/newcomer-now', x: 440, y: 620, w: 340, h: 300, scale: 1, ox: 36, oy: 215, loopMs: 5000,
  },
]

function Live({ piece, playing }: { piece: Piece; playing: boolean }) {
  const [run, setRun] = useState(0)
  const frame = useRef<HTMLIFrameElement>(null)
  const cleanup = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!playing || !piece.loopMs) return
    const every = window.setInterval(() => setRun((r) => r + 1), piece.loopMs)
    return () => window.clearInterval(every)
  }, [playing, piece.loopMs])

  // Scripts only run while playing; leaving Play stops them
  useEffect(() => {
    const win = frame.current?.contentWindow as Win | null | undefined
    if (!playing) {
      cleanup.current?.()
      cleanup.current = null
      return
    }
    if (win && frame.current?.dataset.loaded === 'true' && !cleanup.current) cleanup.current = piece.script?.(win) ?? null
    return () => { cleanup.current?.(); cleanup.current = null }
  }, [playing, run, piece])

  const onLoad = () => {
    const el = frame.current
    if (!el) return
    el.dataset.loaded = 'true'
    // Give the app a moment to mount its screen, then start the script
    if (playing) window.setTimeout(() => {
      const win = el.contentWindow as Win | null
      if (win && !cleanup.current) cleanup.current = piece.script?.(win) ?? null
    }, 700)
  }

  return (
    <iframe
      ref={frame}
      key={run}
      title={piece.name}
      src={`/?embed#${piece.hash}`}
      onLoad={onLoad}
      tabIndex={-1}
      className="absolute border-0 bg-transparent"
      style={{ width: PHONE.w, height: PHONE.h, left: -(piece.ox ?? 0) * piece.scale, top: -(piece.oy ?? 0) * piece.scale, transform: `scale(${piece.scale})`, transformOrigin: '0 0', pointerEvents: 'none' }}
    />
  )
}

export function Collage({ onClose }: { onClose: () => void }) {
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>(() => Object.fromEntries(pieces.map((p) => [p.id, { x: p.x, y: p.y }])))
  const [playing, setPlaying] = useState(false)
  const [z, setZ] = useState<string | null>(null)
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null)
  const canvas = useRef<HTMLDivElement>(null)
  // Over the side panel while dragging a piece: letting go puts it back there
  const [overPanel, setOverPanel] = useState(false)
  const inPanel = (x: number) => x > window.innerWidth - PANEL
  const tray = pieces.filter((p) => !pos[p.id])
  const place = (id: string, x: number, y: number) => setPos((p) => ({ ...p, [id]: { x, y } }))
  const remove = (id: string) => setPos((p) => { const next = { ...p }; delete next[id]; return next })
  // Where a new piece lands: its middle at the drop point, in canvas coordinates
  const drop = (id: string, clientX: number, clientY: number) => {
    const piece = pieces.find((q) => q.id === id)
    const box = canvas.current?.getBoundingClientRect()
    if (!piece || !box) return
    place(id, Math.max(0, clientX - box.left - piece.w / 2), Math.max(0, clientY - box.top - piece.h / 2))
    setZ(id)
  }

  const down = (id: string) => (e: ReactPointerEvent) => {
    drag.current = { id, dx: e.clientX - pos[id].x, dy: e.clientY - pos[id].y }
    e.currentTarget.setPointerCapture(e.pointerId)
    setZ(id)
  }
  const move = (e: ReactPointerEvent) => {
    const d = drag.current
    if (!d) return
    setPos((p) => ({ ...p, [d.id]: { x: e.clientX - d.dx, y: e.clientY - d.dy } }))
    setOverPanel(inPanel(e.clientX))
  }
  const up = (e: ReactPointerEvent) => {
    const d = drag.current
    drag.current = null
    setOverPanel(false)
    if (d && inPanel(e.clientX)) remove(d.id)
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Brand collage" className="fixed inset-0 z-40 overflow-auto bg-baton-paper font-body text-ink">
      <div
        ref={canvas}
        className="relative"
        style={{ width: 1100, height: 1160, minWidth: `calc(100% - ${PANEL}px)` }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { const id = e.dataTransfer.getData('text/plain'); if (id) drop(id, e.clientX, e.clientY) }}
      >
        {pieces.filter((p) => pos[p.id]).map((p) => (
          <div
            key={p.id}
            role="group"
            aria-label={p.name}
            className={`group absolute overflow-hidden ${p.rounded ? 'rounded-[28px] shadow-lg' : ''}`}
            style={{ left: pos[p.id].x, top: pos[p.id].y, width: p.w, height: p.h, zIndex: z === p.id ? 10 : 1 }}
          >
            <Live piece={p} playing={playing} />
            {/* Catches the pointer so a piece drags even over its live app */}
            <button type="button" aria-label={`Remove ${p.name}`} onClick={() => remove(p.id)} className="absolute right-2 top-2 z-10 flex size-7 items-center justify-center rounded-full bg-ink/80 text-subhead leading-none text-surface opacity-0 transition-opacity hover:bg-ink focus-visible:opacity-100 group-hover:opacity-100">×</button>
            <div onPointerDown={down(p.id)} onPointerMove={move} onPointerUp={up} className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing" />
          </div>
        ))}
      </div>
      <aside
        aria-label="Pieces"
        className={`fixed bottom-0 right-0 top-0 z-30 flex flex-col gap-3 overflow-y-auto border-l border-line px-4 pb-6 pt-20 transition-colors ${overPanel ? 'bg-baton-pink/60' : 'bg-baton-cream/90 backdrop-blur'}`}
        style={{ width: PANEL }}
      >
        <p className="text-footnote text-ink-muted">Pieces</p>
        {tray.length === 0 && <p className="text-footnote text-ink-faint">Everything is on the canvas. Drag a piece here, or press × on it, to take it off.</p>}
        {tray.map((p) => (
          <div
            key={p.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', p.id)}
            className="flex cursor-grab items-center justify-between gap-2 rounded-card bg-card px-4 py-3 shadow-sm active:cursor-grabbing"
          >
            <span className="text-subhead font-medium">{p.name}</span>
            <button type="button" onClick={() => place(p.id, p.x, p.y)} aria-label={`Add ${p.name}`} className="rounded-full bg-brand px-3 py-1 text-caption font-medium text-on-brand">Add</button>
          </div>
        ))}
        <p className="mt-auto text-caption text-ink-faint">Drag a piece onto the canvas to add it. Drag a piece on the canvas here to remove it.</p>
      </aside>
      <div className="fixed left-6 top-5 z-20">
        <h1 className="font-display text-title-2">Brand collage</h1>
        <p className="text-subhead text-ink-muted">The real prototype motion. Drag the pieces anywhere; Play loops them.</p>
      </div>
      <div className="fixed top-5 z-40 flex gap-2" style={{ right: PANEL + 24 }}>
        <button type="button" onClick={() => setPlaying((v) => !v)} className="rounded-full bg-brand px-5 py-2 text-subhead font-medium text-on-brand hover:opacity-90">{playing ? 'Pause' : 'Play'}</button>
        <button type="button" onClick={onClose} className="rounded-full bg-ink px-4 py-2 text-subhead font-medium text-surface">Close</button>
      </div>
    </div>
  )
}
