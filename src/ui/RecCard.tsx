import { cx } from './cx'
import { NoteIcon } from './icons'

export type RecTone = 'blue' | 'yellow' | 'pink' | 'olive' | 'cream'

const toneFill: Record<RecTone, string> = {
  blue: 'bg-baton-blue',
  yellow: 'bg-baton-yellow',
  pink: 'bg-baton-pink',
  olive: 'bg-baton-olive',
  cream: 'bg-baton-cream',
}

type ToneTileProps = {
  tone: RecTone
  // Missing src shows the tone color until real photos arrive
  src?: string
  alt: string
  label?: string
  className?: string
}

// Photo area of a recommendation: the photo, or a brand-colored tile with its
// label (Gym, Café) as a stand-in.
export function ToneTile({ tone, src, alt, label, className }: ToneTileProps) {
  return (
    <div className={cx('relative overflow-hidden rounded-tile', toneFill[tone], className)}>
      {src ? (
        <img src={src} alt={alt} draggable={false} className="size-full object-cover" />
      ) : (
        <span role="img" aria-label={alt} className="block size-full" />
      )}
      {label && (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-glass px-2.5 py-1 text-caption font-semibold text-baton-navy backdrop-blur">
          {label}
        </span>
      )}
    </div>
  )
}

type PickCardProps = {
  title: string
  why: string
  label: string
  tone: RecTone
  photo?: string
  onClick?: () => void
}

// Baton's own pick in a sideways row: photo on top, name, and one line on why
// it fits her lifestyle.
export function PickCard({ title, why, label, tone, photo, onClick }: PickCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[232px] shrink-0 snap-start flex-col gap-2.5 rounded-card bg-surface p-2 pb-4 text-left shadow-card transition active:scale-[0.98]"
    >
      <ToneTile tone={tone} src={photo} alt={title} label={label} className="aspect-[4/3] w-full" />
      <div className="flex flex-col gap-1 px-2">
        <p className="font-display text-headline font-semibold text-baton-navy">{title}</p>
        <p className="line-clamp-3 text-subhead text-ink-muted">{why}</p>
      </div>
    </button>
  )
}

type TipCardProps = {
  text: string
  label: string
  notes: number
  onClick?: () => void
}

// A trial-and-error tip from someone's legacy: blue, since it was handed over.
export function TipCard({ text, label, notes, onClick }: TipCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[148px] w-[200px] shrink-0 snap-start flex-col justify-between gap-4 rounded-card bg-baton-blue p-4 text-left transition active:scale-[0.98]"
    >
      <p className="font-display text-title-3 font-semibold text-baton-navy">{text}</p>
      <p className="flex items-center gap-1.5 text-footnote text-on-baton-blue-muted">
        {label}
        {notes > 0 && (
          <>
            <span aria-hidden>·</span>
            <NoteIcon className="size-3.5" />
            {notes}
          </>
        )}
      </p>
    </button>
  )
}
