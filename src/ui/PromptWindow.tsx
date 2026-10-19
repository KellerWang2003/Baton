import { useRef } from 'react'
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
// for (Photo or Write) in a small pill above the prompt. Keller (Oct 18): the
// whole circle is one big blob of liquid glass (React Bits Fluid Glass), tinted
// blue by the glass itself: one layer, no border and no images.
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
  const { give, color, ...glassProps } = tuning
  const drawn = tuning.size * rimRatio
  const box = Math.ceil(drawn / 0.72)
  // With no give (or no dragging), the rim stays put
  const follow = tuning.interaction === 'drag' ? give || 1 : 0
  const down = useRef<{ x: number; y: number } | null>(null)
  // The pill moves with the glass while it's nudged
  const rim = useRef<HTMLSpanElement>(null)
  const nudge = (x: number, y: number, settle = false) => {
    if (!rim.current) return
    rim.current.style.transition = settle ? 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 120ms ease-out'
    rim.current.style.transform = (x || y) && follow ? `translate(${x * follow}px, ${y * follow}px)` : ''
  }
  const release = () => {
    down.current = null
    nudge(0, 0, true)
  }
  const pill = (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-baton-blue/15 px-3 py-1.5 text-subhead font-semibold text-baton-blue">
      {medium === 'photo' ? <SmallCameraIcon /> : <PencilIcon />}
      {mediumLabel}
    </span>
  )
  const words = (
    <span className="text-balance text-center font-display text-[25px] font-medium leading-[1.15] tracking-[-0.01em] text-baton-navy">
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
    inside = (
      <>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: box, height: box }}>
          <FluidGlass
            // Under the glass, the prompt is drawn into its canvas so the lens bends it
            text={crisp ? '' : wrap(question, 24)}
            textColor={token('--color-baton-navy')}
            fontSize={17}
            fontWeight={500}
            color={color || token('--color-glass-tint')}
            // The page's paper, drawn into the canvas so the glass has light to tint
            background={token('--color-baton-paper')}
            {...glassProps}
            // Default is a drag that gives a little, then springs back
            give={give}
          />
        </div>
        {/* The pill (and the prompt, if it sits on top), over the glass */}
        <span
          ref={rim}
          style={{ width: drawn, height: drawn }}
          className="pointer-events-none relative flex flex-col items-center justify-center gap-4 rounded-full px-10"
        >
          <span className={crisp ? undefined : 'absolute top-[13%]'}>{pill}</span>
          {crisp && words}
        </span>
      </>
    )
  }

  return (
    <div className={cx('flex flex-col items-center gap-4', className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label={question}
        onPointerDown={(event) => (down.current = { x: event.clientX, y: event.clientY })}
        onPointerMove={(event) => down.current && nudge(event.clientX - down.current.x, event.clientY - down.current.y)}
        onPointerUp={(event) => {
          const start = down.current
          release()
          // Nudging the glass shouldn't count as a tap that opens the + field
          if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 6) onClick?.()
        }}
        onKeyDown={(event) => event.key === 'Enter' && onClick?.()}
        onPointerCancel={release}
        onPointerLeave={release}
        // Room under the glass for its shadow
        style={{ height: drawn + 100 }}
        className="relative -mx-4 flex items-center justify-center self-stretch overflow-hidden transition active:scale-[0.98]"
      >
        {inside}
      </div>

      {seed && <p className="text-subhead text-baton-navy/55">{seed}</p>}
    </div>
  )
}

// Breaks the prompt into short lines for the glass canvas, which draws text
// line by line without wrapping
function wrap(text: string, width: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > width) {
      lines.push(line)
      line = word
    } else line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  return lines.join('\n')
}

// The WebGL glass takes plain color strings, so read them from the brand tokens
function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
