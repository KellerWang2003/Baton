import { cx } from './cx'
import { PencilIcon, SmallCameraIcon } from './icons'

type PromptWindowProps = {
  question: string
  // Why it showed up (usually where she is), small under the circle
  seed?: string
  medium: 'photo' | 'write'
  mediumLabel: string
  onClick?: () => void
  className?: string
}

// Today's prompt in a round glass window (Figma TODAY 236:1282): what it asks
// for (Photo or Write) in a small pill above the prompt, both inside a white glass
// disc with a blue glow at its edge, inside a hairline ring.
export function PromptWindow({ question, seed, medium, mediumLabel, onClick, className }: PromptWindowProps) {
  return (
    <div className={cx('flex flex-col items-center gap-4', className)}>
      <button
        type="button"
        onClick={onClick}
        className="aspect-square w-full max-w-[342px] rounded-full border border-line/60 p-2 transition active:scale-[0.98]"
      >
        <span className="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-surface/70 shadow-prompt-glass backdrop-blur-xl">
          {/* Light catching the top left of the glass */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-[14%] top-[7%] h-[22%] w-[46%] -rotate-[24deg] rounded-[50%] bg-linear-to-b from-surface/70 to-surface/0 blur-[2px]"
          />
          <span className="relative flex flex-col items-center gap-4 px-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-baton-blue/15 px-3 py-1.5 text-subhead font-semibold text-baton-blue">
              {medium === 'photo' ? <SmallCameraIcon /> : <PencilIcon />}
              {mediumLabel}
            </span>
            <span className="text-balance text-center font-display text-[25px] font-medium leading-[1.15] tracking-[-0.01em] text-baton-navy">
              {question}
            </span>
          </span>
        </span>
      </button>

      {seed && <p className="text-subhead text-baton-navy/55">{seed}</p>}
    </div>
  )
}
