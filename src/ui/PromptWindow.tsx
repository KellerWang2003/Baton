import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from './cx'
import FluidGlass from './FluidGlass'
import { GlassRim } from './GlassRim'
import { PencilIcon, PromptCameraIcon, promptCameraHeight, promptCameraPath, promptCameraWidth } from './icons'
import { defaultGlassTuning, movingGlass } from './promptGlass'
import type { GlassTuning, PromptGlass } from './promptGlass'
import { useScrollNudge } from './useScrollNudge'

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
  // Gets where the circle is, for opening the camera out of it
  onClick?: (circle: { cx: number; cy: number; size: number }) => void
  // Debug > Today orb moves: the motion from before Oct 20 instead of holding still
  moves?: boolean
  className?: string
}

// Fluid Glass draws a bit wider than the size it's given (its rim runs past
// it), and fills only 72% of its own canvas, so the canvas is bigger than the
// circle and spills past the screen edges (clipped there). Extra vertical room
// lets the tethered lens travel over neighboring content without hitting a crop.
const rimRatio = 370 / 330
const dragRoom = 240
// The prompt's size as drawn under the glass (25px once the lens magnifies it)
const PROMPT_SIZE = 23

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
  tuning: baseTuning = defaultGlassTuning,
  onClick,
  moves = false,
  className,
}: PromptWindowProps) {
  const tuning = moves ? { ...baseTuning, ...movingGlass } : baseTuning
  const { give, color, edge, ...glassProps } = tuning
  const drawn = tuning.size * rimRatio
  // The rim around the glass: its outline lands about 4pt inside the size it's
  // given (measured), so this puts that edge under the rim's band with room to
  // breathe. The glass is clipped 3pt inside the hairline, as on the Archive's
  // opened photos, so its soft edge can't darken it
  const rimSize = tuning.size - 4
  const mask = `radial-gradient(circle at 50% 50%, black ${rimSize / 2 - 4}px, transparent ${rimSize / 2 - 3}px)`
  const box = Math.ceil(drawn / 0.72)
  const canvasHeight = box + dragRoom * 2
  // Where a press started, so a drag of the glass doesn't count as a tap
  const down = useRef<{ x: number; y: number } | null>(null)
  const release = () => {
    down.current = null
  }
  const circle = () => {
    const rect = frame.current?.getBoundingClientRect()
    return { cx: rect ? rect.left + rect.width / 2 : 0, cy: rect ? rect.top + rect.height / 2 : 0, size: tuning.size }
  }
  const frame = useRef<HTMLDivElement>(null)
  // When it moves, scrolling the page nudges the glass
  const push = useScrollNudge(frame, moves)
  // The prompt and pill drawn as one picture for the glass to bend, once the
  // brand font has loaded
  const [art, setArt] = useState<{ key: string; url: string } | null>(null)
  const artKey = [question, medium, mediumLabel, box, canvasHeight].join('|')
  useEffect(() => {
    if (glass !== 'glass') return
    let alive = true
    document.fonts.ready.then(() => {
      if (alive) setArt({ key: artKey, url: drawPrompt(box, canvasHeight, question, medium, tuning.size) })
    })
    return () => {
      alive = false
    }
  }, [glass, artKey, box, canvasHeight, question, medium, mediumLabel, tuning.size])
  // Just the icon for what it asks for (Figma TODAY 334:10176)
  const pill = (
    <span role="img" aria-label={mediumLabel} className="inline-flex text-baton-blue">
      {medium === 'photo' ? <PromptCameraIcon /> : <PencilIcon className="size-6" />}
    </span>
  )
  const words = (
    <span className="text-balance text-center font-display text-[30px] font-normal leading-[1.1] tracking-[-0.01em] text-baton-navy">
      {question}
    </span>
  )

  let inside: ReactNode
  if (glass === 'css') {
    inside = (
      <span className="relative flex size-[330px] items-center justify-center overflow-hidden rounded-full bg-baton-paper shadow-prompt-glass">
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
        <div
          data-glass-overlay
          data-html2canvas-ignore
          className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 overflow-x-clip"
          style={{ height: canvasHeight }}
        >
          {/* Clipped just inside the circle, so the glass bulges and breathes
              under a rim that holds still, like the Archive's opened photos */}
          <div
            className="absolute left-1/2 h-full -translate-x-1/2"
            // Moving, it has no rim and isn't clipped, so it can travel
            style={moves ? { width: box } : { width: box, maskImage: mask, WebkitMaskImage: mask }}
          >
            <FluidGlass
              // Set up again when switching, so the new motion takes hold
              key={moves ? 'moves' : 'still'}
              text=""
              // Only prompt artwork belongs in this lens. A page snapshot can
              // pull photos or camera content into the home bubble.
              src={crisp ? undefined : art?.key === artKey ? art.url : undefined}
              color={tint}
              // A fixed paper background keeps the prompt free of page images.
              background={token('--color-baton-paper')}
              transparentOutside
              // A heavier blue at the glass's own rim, fading inward (Figma 236:1282)
              rim={edge}
              {...glassProps}
              give={give}
              pushRef={push}
            />
          </div>
        </div>
        {!moves && <GlassRim size={rimSize} className="z-[21]" />}
        {/* For the prompt-on-top look only: pill and prompt over the glass,
            the prompt at the glass's center and the pill above it */}
        <span
          data-html2canvas-ignore={crisp || undefined}
          style={{ width: drawn, height: drawn }}
          className={cx('pointer-events-none relative flex select-none items-center justify-center rounded-full px-10', crisp && 'z-30')}
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
    <div className={cx('relative z-10 flex flex-col items-center gap-4', className)}>
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
          if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 6) onClick?.(circle())
        }}
        onKeyDown={(event) => event.key === 'Enter' && onClick?.(circle())}
        onPointerCancel={release}
        onPointerLeave={release}
        // Takes up just the glass itself (it draws about its size), so the space
        // above and below matches Figma 236:1282; the -my-6 is room for its
        // soft shadow without pushing things apart. Span the full page gutter
        // so the lens clips at the screen edge, never at the content padding.
        style={{ height: tuning.size + 60 }}
        className="relative -mx-gutter -my-6 flex items-center justify-center self-stretch overflow-visible"
      >
        {inside}
      </div>

      {/* Above the glass canvas, which spills a little past the circle */}
      {seed && <p className="relative z-10 text-subhead text-baton-navy/55">{seed}</p>}
    </div>
  )
}

// The prompt and its medium's icon on a transparent canvas, leaving the page
// visible outside the lens: the prompt centered, the icon above it. Returns a
// data URL for the glass to bend.
function drawPrompt(box: number, height: number, question: string, medium: 'photo' | 'write', size: number) {
  const ratio = 2
  const canvas = document.createElement('canvas')
  canvas.width = box * ratio
  canvas.height = height * ratio
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.scale(ratio, ratio)
  const family = token('--font-display')
  const navy = token('--color-baton-navy')
  const blue = token('--color-baton-blue')

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
  // The lens magnifies its middle about 1.08x, so 23px drawn reads as 25px on
  // screen (Keller, Oct 20); long prompts shrink to fit three lines
  let fontSize = PROMPT_SIZE
  let lines: string[] = []
  for (; fontSize >= 18; fontSize--) {
    ctx.font = `400 ${fontSize}px ${family}`
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${-0.011 * fontSize}px`
    lines = balanced(size - 110)
    if (lines.length <= 3) break
  }
  fontSize = Math.max(fontSize, 18)
  const lineHeight = Math.round(fontSize * 1.2)
  // The medium's icon above the prompt, alone (Figma TODAY 334:10176)
  const iconSize = 24
  const iconGap = 16
  // Icon and prompt centered together, then nudged up a little to the
  // optical center, which sits just above the geometric one
  const groupHeight = iconSize + iconGap + lines.length * lineHeight
  const opticalLift = size * 0.035
  const top = height / 2 - groupHeight / 2 + iconSize + iconGap - opticalLift
  ctx.fillStyle = navy
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lines.forEach((text, i) => ctx.fillText(text, box / 2, top + lineHeight * (i + 0.5)))

  // The icon, from the same 24px icons as the app
  ctx.save()
  ctx.translate(box / 2 - iconSize / 2, top - iconGap - iconSize)
  if (medium === 'photo') {
    // Centered in the 24px icon box, at its own width like the SVG
    ctx.translate((iconSize - promptCameraWidth) / 2, (iconSize - promptCameraHeight) / 2)
    ctx.fillStyle = blue
    ctx.fill(new Path2D(promptCameraPath))
  } else {
    ctx.strokeStyle = blue
    ctx.lineWidth = 1.8
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ;['M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z', 'M13.5 7l3 3'].forEach((d) => ctx.stroke(new Path2D(d)))
  }
  ctx.restore()

  return canvas.toDataURL('image/png')
}

// The WebGL glass takes plain color strings, so read them from the brand tokens
function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
