import type { ReactNode } from 'react'
import { cx } from './cx'

type TodayCardProps = {
  title: string
  // Parts of the title to pick out in blue (places, people)
  highlight?: string[]
  subtitle?: string
  // A photo on the left, or another leading element (a check circle)
  photo?: string
  // Which part of the photo shows in the square (CSS object-position)
  photoPosition?: string
  leading?: ReactNode
  trailing?: ReactNode
  done?: boolean
  onClick?: () => void
}

// Splits a title around its highlighted parts, keeping the order
function parts(title: string, highlight: string[]) {
  if (!highlight.length) return [{ text: title, on: false }]
  const pattern = new RegExp(`(${highlight.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`)
  return title
    .split(pattern)
    .filter(Boolean)
    .map((text) => ({ text, on: highlight.includes(text) }))
}

// A card in Today's "Before you leave" list (Figma TODAY 334:11284): a photo
// from her archive, a title with its places and people in blue, and the
// reason it's suggested.
export function TodayCard({ title, highlight = [], subtitle, photo, photoPosition, leading, trailing, done = false, onClick }: TodayCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex min-h-[81px] w-full items-center gap-2.5 rounded-[16px] bg-today-panel p-2.5 text-left shadow-today-card transition active:scale-[0.99] disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {photo ? (
        <img src={photo} alt="" className="size-[61px] shrink-0 rounded-[12px] object-cover" style={{ objectPosition: photoPosition }} />
      ) : (
        leading && <span className="flex size-[61px] shrink-0 items-center justify-center">{leading}</span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className={cx('text-today-card font-medium', done ? 'text-ink-muted line-through' : 'text-ink')}>
          {parts(title, highlight).map((part, index) =>
            part.on ? (
              <span key={index} className="text-highlight">
                {part.text}
              </span>
            ) : (
              part.text
            ),
          )}
        </span>
        {subtitle && <span className="text-today-detail text-today-muted">{subtitle}</span>}
      </span>
      {trailing}
    </button>
  )
}
