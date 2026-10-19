import { useState } from 'react'
import { cx } from './cx'
import { CheckIcon, DownloadIcon } from './icons'

// Round save button that sits left of a glow CTA (Rolling Paper, LA Wrapped).
// A mock: tapping it turns it into a check and says where it went, centered
// just above the button row it sits in (the row must be positioned).
export function SaveButton({ label, savedLabel = 'Saved to Photos' }: { label: string; savedLabel?: string }) {
  const [saved, setSaved] = useState(false)
  return (
    <>
      <button
        type="button"
        aria-label={saved ? savedLabel : label}
        onClick={() => setSaved(true)}
        className={cx(
          'pointer-events-auto flex size-[52px] shrink-0 items-center justify-center rounded-full shadow-float transition active:scale-95',
          saved ? 'bg-baton-blue text-white' : 'bg-white text-baton-blue',
        )}
      >
        {saved ? <CheckIcon /> : <DownloadIcon />}
      </button>
      {saved && (
        <p
          role="status"
          className="pointer-events-none absolute inset-x-0 bottom-[64px] animate-splash-rise text-center text-footnote text-ink-muted"
        >
          {savedLabel}
        </p>
      )}
    </>
  )
}
