import { cx } from './cx'

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
  // "Maya's market"
  title: string
  // In their own words
  quote: string
  tone: RecTone
  photo?: string
  onClick?: () => void
}

// A tip from someone's legacy, as a quote: their place on a photo, its name,
// and what they'd tell you about it.
export function TipCard({ title, quote, tone, photo, onClick }: TipCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[248px] shrink-0 snap-start flex-col gap-3 rounded-card bg-baton-cream p-2.5 pb-5 text-left transition active:scale-[0.98]"
    >
      <ToneTile tone={tone} src={photo} alt={title} className="aspect-[16/10] w-full" />
      <div className="flex flex-col gap-1 px-2.5">
        <p className="font-display text-title-3 font-bold text-baton-navy">{title}</p>
        <p className="line-clamp-3 text-callout text-on-baton-cream-muted">“{quote}”</p>
      </div>
    </button>
  )
}
