import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from './cx'
import FluidGlass from './FluidGlass'
import { PencilIcon, SmallCameraIcon } from './icons'
import { defaultGlassTuning } from './promptGlass'
import type { GlassTuning, PromptGlass } from './promptGlass'

type PromptWindowProps = {
  question: string
  // Why it showed up (usually where she is), small under the circle
  seed?: string
  medium: 'photo' | 'write'
  mediumLabel: string
  // How the circle is drawn (Today looks playground)
  glass?: PromptGlass
  // Fluid Glass settings (debug panel > Today glass)
  tuning?: GlassTuning
  onClick?: () => void
  className?: string
}

// Fluid Glass draws a bit wider than the size it's given (its rim runs past
// it), and fills only 72% of its own canvas, so the canvas is bigger than the
// circle and spills past the screen edges (clipped there)
const rimRatio = 370 / 330

// Today's prompt in a round window (Figma TODAY 236:1282), with what it asks
// for (Photo or Write) in a small pill above the prompt. Keller (Oct 18-19): the
// whole circle is one big blob of liquid glass (React Bits Fluid Glass), and
// the prompt and pill sit under it, so moving the glass bends them.
export function PromptWindow({
  question,
  seed,
  medium,
  mediumLabel,
  glass = 'glass',
  tuning = defaultGlassTuning,
  onClick,
  className,
}: PromptWindowProps) {
  const { give, color, edge, ...glassProps } = tuning
  const drawn = tuning.size * rimRatio
  const box = Math.ceil(drawn / 0.72)
  // Where a press started, so a drag of the glass doesn't count as a tap
  const down = useRef<{ x: number; y: number } | null>(null)
  const release = () => {
    down.current = null
  }
  // Scrolling the page nudges the glass a little with the scroll's speed, as if
  // it had weight, then it springs back (Keller, Oct 19)
  const frame = useRef<HTMLDivElement>(null)
  const push = useRef<((vx: number, vy: number) => void) | null>(null)
  useEffect(() => {
    let scroller = frame.current?.parentElement ?? null
    while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) scroller = scroller.parentElement
    if (!scroller) return
    const page = scroller
    let lastTop = page.scrollTop
    let lastTime = performance.now()
    const onScroll = () => {
      const now = performance.now()
      const speed = (page.scrollTop - lastTop) / Math.max((now - lastTime) / 1000, 0.008)
      lastTop = page.scrollTop
      lastTime = now
      // The content moves up as she scrolls down, so the glass lags behind it
      // Tiny: the glass's spring is soft, so this moves it at most ~4px and
      // it stays mostly in place (Keller, Oct 19)
      const kick = Math.max(-16, Math.min(16, speed * 0.008))
      push.current?.(0, kick)
    }
    page.addEventListener('scroll', onScroll, { passive: true })
    return () => page.removeEventListener('scroll', onScroll)
  }, [])
  // The prompt and pill drawn as one picture for the glass to bend, once the
  // brand font has loaded
  const [art, setArt] = useState<{ key: string; url: string } | null>(null)
  const artKey = [question, medium, mediumLabel, box].join('|')
  useEffect(() => {
    if (glass !== 'glass') return
    let alive = true
    document.fonts.ready.then(() => {
      if (alive) setArt({ key: artKey, url: drawPrompt(box, question, medium, mediumLabel, tuning.size) })
    })
    return () => {
      alive = false
    }
  }, [glass, artKey, box, question, medium, mediumLabel, tuning.size])
  const pill = (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-baton-blue/15 px-3 py-1.5 text-subhead font-semibold text-baton-blue">
      {medium === 'photo' ? <SmallCameraIcon /> : <PencilIcon />}
      {mediumLabel}
    </span>
  )
  const words = (
    <span className="text-balance text-center font-display text-[30px] font-medium leading-[1.1] tracking-[-0.01em] text-baton-navy">
      {question}
    </span>
  )

  let inside: ReactNode
  if (glass === 'css') {
    inside = (
      <span className="relative flex size-[330px] items-center justify-center overflow-hidden rounded-full bg-surface/70 shadow-prompt-glass backdrop-blur-xl">
        {/* Light catching the top left of the glass */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[14%] top-[7%] h-[22%] w-[46%] -rotate-[24deg] rounded-[50%] bg-linear-to-b from-surface/70 to-surface/0 blur-[2px]"
        />
        <span className="relative flex flex-col items-center gap-4 px-10">
          {pill}
          {words}
        </span>
      </span>
    )
  } else {
    const crisp = glass === 'glass-crisp'
    const tint = color || token('--color-baton-blue')
    inside = (
      <>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: box, height: box }}>
          <FluidGlass
            text=""
            // Under the glass: the prompt and pill, drawn into its canvas so it bends them
            src={crisp ? undefined : art?.key === artKey ? art.url : undefined}
            color={tint}
            // The page's paper, drawn into the canvas so the glass has light to tint
            background={token('--color-baton-paper')}
            // A heavier blue at the glass's own rim, fading inward (Figma 236:1282)
            rim={edge}
            {...glassProps}
            // Default is a drag that gives a little, then springs back
            give={give}
            pushRef={push}
          />
        </div>
        {/* For the prompt-on-top look only: pill and prompt over the glass,
            the prompt at the glass's center and the pill above it */}
        <span
          style={{ width: drawn, height: drawn }}
          className="pointer-events-none relative flex select-none items-center justify-center rounded-full px-10"
        >
          {crisp && (
            <span className="relative flex justify-center">
              <span className="absolute bottom-full mb-2">{pill}</span>
              {words}
            </span>
          )}
        </span>
      </>
    )
  }

  return (
    <div className={cx('flex flex-col items-center gap-4', className)}>
      <div
        ref={frame}
        role="button"
        tabIndex={0}
        aria-label={question}
        onPointerDown={(event) => (down.current = { x: event.clientX, y: event.clientY })}
        onPointerUp={(event) => {
          const start = down.current
          release()
          // Nudging the glass shouldn't count as a tap that opens the + field
          if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 6) onClick?.()
        }}
        onKeyDown={(event) => event.key === 'Enter' && onClick?.()}
        onPointerCancel={release}
        onPointerLeave={release}
        // Takes up just the glass itself (it draws about its size), so the space
        // above and below matches Figma 236:1282; the -my-6 is room for its
        // soft shadow without pushing things apart
        style={{ height: tuning.size + 60 }}
        className="relative -mx-4 -my-6 flex items-center justify-center self-stretch overflow-hidden transition active:scale-[0.98]"
      >
        {inside}
      </div>

      {/* Above the glass canvas, which spills a little past the circle */}
      {seed && <p className="relative z-10 text-subhead text-baton-navy/55">{seed}</p>}
    </div>
  )
}

// The prompt and its medium pill, drawn on paper the size of the glass
// canvas: the prompt centered, the pill 8px above
// it. Returns a data URL for the glass to bend.
function drawPrompt(box: number, question: string, medium: 'photo' | 'write', label: string, size: number) {
  const ratio = 2
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = box * ratio
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.scale(ratio, ratio)
  const family = token('--font-display')
  const navy = token('--color-baton-navy')
  const blue = token('--color-baton-blue')

  ctx.fillStyle = token('--color-baton-paper')
  ctx.fillRect(0, 0, box, box)

  // Wrap the prompt to fit inside the circle. It starts a little smaller than
  // the 30px type on top, since the glass magnifies it, and shrinks for long
  // prompts so they stay within three lines (down to 20px)
  const wrapAt = (width: number) => {
    const out: string[] = []
    let line = ''
    for (const word of question.split(' ')) {
      const next = line ? `${line} ${word}` : word
      if (line && ctx.measureText(next).width > width) {
        out.push(line)
        line = word
      } else line = next
    }
    if (line) out.push(line)
    return out
  }
  // Balanced like text-wrap: balance, so no word is left alone on the last line
  const balanced = (maxWidth: number) => {
    let lines = wrapAt(maxWidth)
    for (let width = maxWidth; width > maxWidth * 0.6; width -= 4) {
      const tighter = wrapAt(width)
      if (tighter.length > lines.length) break
      lines = tighter
    }
    return lines
  }
  let fontSize = 27
  let lines: string[] = []
  for (; fontSize >= 20; fontSize--) {
    ctx.font = `500 ${fontSize}px ${family}`
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${-0.011 * fontSize}px`
    lines = balanced(size - 110)
    if (lines.length <= 3) break
  }
  fontSize = Math.max(fontSize, 20)
  const lineHeight = Math.round(fontSize * 1.1)
  const pillHeight = 32
  const pillGap = 8
  // Pill and prompt centered together, then nudged up a little to the
  // optical center, which sits just above the geometric one
  const groupHeight = pillHeight + pillGap + lines.length * lineHeight
  const opticalLift = size * 0.035
  const top = box / 2 - groupHeight / 2 + pillHeight + pillGap - opticalLift
  ctx.fillStyle = navy
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lines.forEach((text, i) => ctx.fillText(text, box / 2, top + lineHeight * (i + 0.5)))

  // The pill: 15px semibold label after a 24px icon, 12px sides, 32px tall
  ctx.font = `600 15px ${family}`
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
  const pillWidth = 12 + 24 + 6 + ctx.measureText(label).width + 12
  const pillX = box / 2 - pillWidth / 2
  const pillY = top - pillGap - pillHeight
  ctx.globalAlpha = 0.15
  ctx.fillStyle = blue
  ctx.beginPath()
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2)
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.fillStyle = blue
  ctx.textAlign = 'left'
  ctx.fillText(label, pillX + 12 + 24 + 6, pillY + pillHeight / 2 + 1)
  // The icon, from the same 24px line icons as the app
  ctx.save()
  ctx.translate(pillX + 12, pillY + 4)
  ctx.strokeStyle = blue
  ctx.lineWidth = 1.8
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const paths =
    medium === 'photo'
      ? ['M3 8.5A1.5 1.5 0 0 1 4.5 7h2.3l1.5-2h7.4l1.5 2h2.3A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z', 'M15.5 13a3.5 3.5 0 1 1-7 0a3.5 3.5 0 1 1 7 0']
      : ['M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z', 'M13.5 7l3 3']
  paths.forEach((d) => ctx.stroke(new Path2D(d)))
  ctx.restore()

  return canvas.toDataURL('image/png')
}

// The WebGL glass takes plain color strings, so read them from the brand tokens
function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
