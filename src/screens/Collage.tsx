import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { paperNotes } from '../data/rollingPaper'
import FluidGlass from '../ui/FluidGlass'
import { TAB_PATH, TAB_WIDTH, folderTones } from '../ui/folderStyles'
import { cx } from '../ui/cx'

// Brand collage playground (team only: Debug > Brand collage, or ?collage): the
// prototype's little motion pieces on a plain canvas. Drag any piece to move it;
// Play loops them all on one shared clock (0..1 every LOOP ms).
const LOOP = 6000
const ease = (x: number) => x * x * (3 - 2 * x)
// 0 before a, 1 after b, eased in between
const span = (t: number, a: number, b: number) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))))

const photos = ['11951', '11954', '11957', '11960', '16', '18', '19', '20'].map((n) => `/archive/la-cloud/${n}.jpg`)

type Piece = { id: string; name: string; x: number; y: number; w: number; h: number; render: (t: number, playing: boolean) => ReactNode }

const pieces: Piece[] = [
  {
    id: 'blob', name: "Today's blob", x: 60, y: 40, w: 300, h: 300,
    render: (_t, playing) => (
      <div className="relative h-full w-full">
        <div className="absolute inset-[34px]" style={{ background: 'radial-gradient(circle at 50% 50%, #f7f3ef 45%, #cfe3ff 75%, #59a1ff 100%)', borderRadius: playing ? `${50 + 10 * Math.sin(_t * 6.28 * 2)}% ${50 - 10 * Math.sin(_t * 6.28 * 2)}% ${50 + 8 * Math.cos(_t * 6.28 * 2)}% ${50 - 8 * Math.cos(_t * 6.28 * 2)}%` : '50%', boxShadow: '0 10px 30px rgb(89 161 255 / .25)' }} />
        <FluidGlass
          text="Take a photo"
          fontSize={36}
          shape="blob"
          size={230}
          color="#59a1ff"
          rim={0.36}
          ring={1}
          breathe={playing ? 0.6 : 0.25}
          wobble={0.5}
          idle={playing}
          interaction="static"
          background="#f7f3ef"
          transparentOutside
        />
      </div>
    ),
  },
  {
    id: 'archive', name: 'Archive scrolling', x: 420, y: 60, w: 300, h: 220,
    render: (t) => {
      const shift = -t * 4 * 140
      return (
        <div className="h-full w-full overflow-hidden rounded-[28px] bg-baton-cream shadow-lg">
          <div className="flex h-full items-center gap-3 px-3" style={{ transform: `translateX(${shift}px)` }}>
            {[...photos, ...photos].map((src, i) => (
              <img key={i} src={src} alt="" draggable={false} className="h-[140px] w-[128px] shrink-0 rounded-full object-cover" style={{ transform: `translateY(${Math.sin(i * 1.7 + t * 6.28) * 24}px)` }} />
            ))}
          </div>
        </div>
      )
    },
  },
  {
    id: 'bubble', name: 'Intention bubble', x: 800, y: 40, w: 220, h: 220,
    render: (t) => {
      const on = span(t, 0.3, 0.55) * (1 - span(t, 0.85, 0.98))
      const squish = 1 - 0.08 * Math.sin(Math.min(1, Math.max(0, (t - 0.28) / 0.1)) * Math.PI)
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="relative flex h-[190px] w-[190px] items-center justify-center rounded-full" style={{ transform: `scale(${squish})` }}>
            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 50% 45%, #f7f3ef 55%, #cfe3ff 80%, #59a1ff 100%)', boxShadow: 'inset 0 0 0 2px rgb(255 255 255 / .8), 0 8px 24px rgb(34 36 48 / .1)' }} />
            <div className="absolute inset-0 rounded-full" style={{ opacity: on, background: 'radial-gradient(circle, #59a1ff 25%, #c9defb 100%)' }} />
            <span className="relative max-w-[130px] text-center font-display text-title-3 leading-tight" style={{ color: on > 0.5 ? '#efe6e2' : '#222430' }}>Find people who share my hobby</span>
          </div>
        </div>
      )
    },
  },
  {
    id: 'post', name: 'Tap to post', x: 90, y: 400, w: 260, h: 300,
    render: (t) => {
      const tap = Math.sin(Math.min(1, Math.max(0, (t - 0.2) / 0.25)) * Math.PI)
      const land = span(t, 0.38, 0.5)
      const out = span(t, 0.9, 1)
      return (
        <div className="relative h-full w-full">
          <div className="absolute left-1/2 top-[210px] h-[70px] w-[70px] -translate-x-1/2 rounded-full bg-baton-blue/25" style={{ transform: `translateX(-50%) scale(${1 + tap * 1.4})`, opacity: tap * 0.8 }} />
          <div className="absolute left-1/2 top-[220px] h-[50px] w-[50px] -translate-x-1/2 rounded-full bg-baton-blue shadow-md" style={{ transform: `translateX(-50%) scale(${1 - tap * 0.15})` }} />
          <div className="absolute left-1/2 top-[10px] flex h-[170px] w-[190px] items-center justify-center rounded-[14px] bg-baton-yellow p-5 font-display text-title-3 leading-snug text-baton-olive shadow-lg" style={{ opacity: land * (1 - out), transform: `translateX(-50%) rotate(${-4 + (1 - land) * 14}deg) scale(${1.25 - land * 0.25})` }}>
            The window seat at Lake Ave is mine.
          </div>
        </div>
      )
    },
  },
  {
    id: 'paper', name: 'Rolling Paper', x: 440, y: 340, w: 330, h: 360,
    render: (t) => {
      const notes = paperNotes.slice(0, 6)
      const lift = span(t, 0.35, 0.55) * (1 - span(t, 0.8, 0.95))
      return (
        <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-baton-paper shadow-lg">
          {notes.map((n, i) => {
            const picked = i === 2
            const draw = span(t, 0.05 + i * 0.05, 0.2 + i * 0.05)
            const col = i % 2, row = Math.floor(i / 2)
            const x = 28 + col * 150 + (picked ? (165 - 28 - 150 + 30) * lift : 0)
            const y = 30 + row * 105 + (picked ? (130 - 30 - 210) * lift : 0)
            return (
              <div key={n.name} className={cx('absolute flex h-[96px] w-[118px] items-center justify-center rounded-md p-2 text-center text-caption leading-tight shadow-md', `bg-baton-${n.color}`, n.color === 'blue' || n.color === 'olive' ? 'text-baton-cream' : 'text-baton-navy')} style={{ left: x, top: y, opacity: draw, transform: `rotate(${n.rotate * (1 - lift * (picked ? 1 : 0))}deg) scale(${1 + (picked ? lift * 0.6 : 0)})`, zIndex: picked ? 5 : 1 }}>
                {n.text.slice(0, picked ? 60 : 36)}…
              </div>
            )
          })}
          <img src="/rolling-paper/doodles/doodle-1.png" alt="" draggable={false} className="absolute right-6 top-4 w-9" style={{ opacity: span(t, 0.2, 0.3) * (1 - lift) }} />
        </div>
      )
    },
  },
  {
    id: 'folders', name: 'Folder stack', x: 840, y: 340, w: 340, h: 300,
    render: (t) => {
      // Two tilted folders, the front one sliding over the back one and settling
      const slide = Math.sin(t * Math.PI * 2)
      const stack = [
        { tone: 'blue', city: 'LA', dates: '09.2018-12.2020', left: 10, top: 20, rot: 6 + slide * 2 },
        { tone: 'pink', city: 'Chicago', dates: '11.2020-06.2022', left: 70 + slide * 14, top: 70 - slide * 6, rot: 6 - slide * 2 },
      ] as const
      return (
        <div className="relative h-full w-full">
          {stack.map((f) => {
            const tone = folderTones[f.tone]
            return (
              <div key={f.city} className="absolute w-[240px]" style={{ left: f.left, top: f.top, transform: `rotate(${f.rot}deg)`, transformOrigin: '50% 50%' }}>
                <svg width={TAB_WIDTH * 0.72} height={53 * 0.72} viewBox={`0 0 ${TAB_WIDTH} 53`} className={cx('ml-[8px] block', tone.fillText)}><path d={TAB_PATH} fill="currentColor" /></svg>
                <p className={cx('absolute left-[40px] top-[6px] font-display text-subhead', tone.title)}>{f.city}</p>
                <div className={cx('flex h-[170px] items-center justify-center rounded-[28px] rounded-tl-[8px]', tone.fill)} style={{ marginTop: -1 }}>
                  <span className={cx('font-display text-title-3', tone.body)}>{f.dates}</span>
                </div>
              </div>
            )
          })}
        </div>
      )
    },
  },
]

export function Collage({ onClose }: { onClose: () => void }) {
  const [pos, setPos] = useState(() => Object.fromEntries(pieces.map((p) => [p.id, { x: p.x, y: p.y }])))
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null)
  const [z, setZ] = useState<string | null>(null)

  useEffect(() => {
    if (!playing) return
    const start = performance.now()
    let raf = 0
    const frame = (now: number) => {
      setT(((now - start) % LOOP) / LOOP)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const down = (id: string) => (e: ReactPointerEvent) => {
    drag.current = { id, dx: e.clientX - pos[id].x, dy: e.clientY - pos[id].y }
    e.currentTarget.setPointerCapture(e.pointerId)
    setZ(id)
  }
  const move = (e: ReactPointerEvent) => {
    const d = drag.current
    if (d) setPos((p) => ({ ...p, [d.id]: { x: e.clientX - d.dx, y: e.clientY - d.dy } }))
  }

  // Paused shows each piece mid-story, not blank
  const shown = playing ? t : 0.5
  return (
    <div role="dialog" aria-modal="true" aria-label="Brand collage" className="fixed inset-0 z-40 overflow-auto bg-baton-paper font-body text-ink">
      <div className="relative" style={{ width: 1240, height: 780, minWidth: '100%' }}>
        {pieces.map((p) => (
          <div
            key={p.id}
            role="group"
            aria-label={p.name}
            onPointerDown={down(p.id)}
            onPointerMove={move}
            onPointerUp={() => { drag.current = null }}
            className="absolute cursor-grab touch-none select-none active:cursor-grabbing"
            style={{ left: pos[p.id].x, top: pos[p.id].y, width: p.w, height: p.h, zIndex: z === p.id ? 10 : 1 } as CSSProperties}
          >
            {p.render(shown, playing)}
          </div>
        ))}
      </div>
      <div className="fixed left-6 top-5 z-20">
        <h1 className="font-display text-title-2">Brand collage</h1>
        <p className="text-subhead text-ink-muted">Drag the pieces anywhere. Play loops their motion.</p>
      </div>
      <div className="fixed right-6 top-5 z-20 flex gap-2">
        <button type="button" onClick={() => setPlaying((v) => !v)} className="rounded-full bg-brand px-5 py-2 text-subhead font-medium text-on-brand hover:opacity-90">{playing ? 'Pause' : 'Play'}</button>
        <button type="button" onClick={onClose} className="rounded-full bg-ink px-4 py-2 text-subhead font-medium text-surface">Close</button>
      </div>
    </div>
  )
}
