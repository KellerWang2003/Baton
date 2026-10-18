import type { ReactNode } from 'react'
import { cx } from './cx'
import FluidGlass from './FluidGlass'
import { PencilIcon, SmallCameraIcon } from './icons'
import type { PromptGlass } from './promptGlass'

type PromptWindowProps = {
  question: string
  // Why it showed up (usually where she is), small under the circle
  seed?: string
  medium: 'photo' | 'write'
  mediumLabel: string
  // How the circle is drawn (Today looks playground); css is the plain disc
  glass?: PromptGlass
  // What the Fluid Glass looks bend: one of her photos, and brand color
  media?: { photo: string; color: string }
  onClick?: () => void
  className?: string
}

// Today's prompt in a round glass window (Figma TODAY 236:1282): what it asks
// for (Photo or Write) in a small pill above the prompt, both inside the
// circle, inside a hairline ring. The plain look is a white disc with a blue
// glow; the others put React Bits Fluid Glass inside the circle.
export function PromptWindow({ question, seed, medium, mediumLabel, glass = 'css', media, onClick, className }: PromptWindowProps) {
  // on: what the pill sits on (paper, a photo, or brand color)
  const pill = (on: 'paper' | 'photo' | 'color') => (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-subhead font-semibold',
        on === 'photo' && 'bg-white/25 text-white backdrop-blur',
        on === 'color' && 'bg-white/70 text-baton-navy',
        on === 'paper' && 'bg-baton-blue/15 text-baton-blue',
      )}
    >
      {medium === 'photo' ? <SmallCameraIcon /> : <PencilIcon />}
      {mediumLabel}
    </span>
  )
  const words = (light: boolean) => (
    <span
      className={cx(
        'text-balance text-center font-display text-[25px] font-medium leading-[1.15] tracking-[-0.01em]',
        light ? 'text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.45)]' : 'text-baton-navy',
      )}
    >
      {question}
    </span>
  )

  let inside: ReactNode
  if (glass === 'css' || !media) {
    inside = (
      <span className="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-surface/70 shadow-prompt-glass backdrop-blur-xl">
        {/* Light catching the top left of the glass */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[14%] top-[7%] h-[22%] w-[46%] -rotate-[24deg] rounded-[50%] bg-linear-to-b from-surface/70 to-surface/0 blur-[2px]"
        />
        <span className="relative flex flex-col items-center gap-4 px-10">
          {pill('paper')}
          {words(false)}
        </span>
      </span>
    )
  } else if (glass === 'lens-text') {
    // The prompt is drawn into the glass's own canvas, so the lens bends the words
    inside = (
      <Disc>
        <FluidGlass
          text={wrap(question, 24)}
          textColor={token('--color-baton-navy')}
          fontSize={17}
          refraction={0.7}
          fontWeight={500}
          background={token('--color-baton-paper')}
          shape="lens"
          size={1000}
          dispersion={0.25}
          shadow={0.3}
          idle={false}
          morphOnClick={false}
          intro={false}
        />
        <span className="pointer-events-none absolute inset-x-0 top-[9%] flex justify-center">{pill('paper')}</span>
      </Disc>
    )
  } else {
    const photo = glass === 'lens-photo' || glass === 'blob-photo'
    inside = (
      <Disc>
        <FluidGlass
          text=""
          src={photo ? media.photo : media.color}
          shape={glass === 'blob-photo' ? 'blob' : 'lens'}
          size={1000}
          dispersion={glass === 'lens-color' ? 0.9 : 0.35}
          frost={glass === 'frost-color' ? 0.55 : 0}
          color={token('--color-baton-blue')}
          tint={glass === 'frost-color' ? 0.35 : 0}
          shadow={0.3}
          interaction={glass === 'blob-photo' ? 'drag' : 'follow'}
          wobble={glass === 'blob-photo' ? 0.9 : 0.5}
          morphOnClick={false}
        />
        {photo && <span aria-hidden className="pointer-events-none absolute inset-0 bg-baton-navy/25" />}
        <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 px-10">
          {pill(photo ? 'photo' : 'color')}
          {words(photo)}
        </span>
      </Disc>
    )
  }

  return (
    <div className={cx('flex flex-col items-center gap-4', className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        className="aspect-square w-full max-w-[342px] rounded-full border border-line/60 p-2 transition active:scale-[0.98]"
      >
        {inside}
      </div>

      {seed && <p className="text-subhead text-baton-navy/55">{seed}</p>}
    </div>
  )
}

// The round window the Fluid Glass canvas is clipped to
function Disc({ children }: { children: ReactNode }) {
  return (
    <span className="relative block size-full overflow-hidden rounded-full shadow-[inset_0_2px_2px_white,0_18px_40px_rgb(0_0_0/0.06)]">
      {children}
    </span>
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
