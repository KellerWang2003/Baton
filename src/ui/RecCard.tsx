import type { ButtonHTMLAttributes } from 'react'
import { cx } from './cx'

export type RecTone = 'blue' | 'yellow' | 'pink' | 'olive' | 'cream' | 'navy'

const toneFill: Record<RecTone, string> = {
  blue: 'bg-baton-blue text-baton-navy',
  yellow: 'bg-baton-yellow text-baton-navy',
  pink: 'bg-baton-pink text-baton-navy',
  olive: 'bg-baton-olive text-on-brand',
  cream: 'bg-baton-cream text-baton-navy',
  navy: 'bg-baton-navy text-on-brand',
}

type ToneTileProps = {
  tone: RecTone
  src?: string
  alt: string
  label?: string
  className?: string
}

// Photo area of a recommendation: the photo, or its category color until one
// arrives, with an optional label (the category) on top.
export function ToneTile({ tone, src, alt, label, className }: ToneTileProps) {
  return (
    <div className={cx('relative overflow-hidden rounded-card', toneFill[tone], className)}>
      {src ? (
        <img src={src} alt={alt} draggable={false} className="size-full object-cover" />
      ) : (
        <span role="img" aria-label={alt} className="block size-full" />
      )}
      {label && (
        <span className="absolute left-3 top-3 rounded-full bg-glass px-2.5 py-1 text-caption font-semibold text-baton-navy backdrop-blur">
          {label}
        </span>
      )}
    </div>
  )
}

const recSizes = {
  // Baton's picks
  lg: { card: 'w-[266px]', photo: 'h-[197px]' },
  // Tips from people
  sm: { card: 'w-[222px]', photo: 'h-[110px]' },
}

type RecCardProps = {
  title: string
  // Why it fits her, or the person's own words
  text: string
  tone: RecTone
  photo: string
  size?: keyof typeof recSizes
  onClick?: () => void
}

// A recommendation in a sideways row (Figma Relay 265:2550): the card takes its
// category color, a rounded photo on top, a bold name and a softer line under it.
export function RecCard({ title, text, tone, photo, size = 'lg', onClick }: RecCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex shrink-0 snap-start flex-col gap-3 overflow-hidden rounded-rec p-3 text-left transition active:scale-[0.98]',
        toneFill[tone],
        recSizes[size].card,
      )}
    >
      <img src={photo} alt="" draggable={false} className={cx('w-full rounded-card object-cover', recSizes[size].photo)} />
      <div className="flex flex-col gap-1 px-2 pb-2">
        <p className="font-display text-title-3 font-bold">{title}</p>
        <p className="line-clamp-3 text-subhead opacity-60">{text}</p>
      </div>
    </button>
  )
}

const toneDot: Record<RecTone, string> = {
  blue: 'bg-baton-blue',
  yellow: 'bg-baton-yellow',
  pink: 'bg-baton-pink',
  olive: 'bg-baton-olive',
  cream: 'bg-baton-cream ring-1 ring-line',
  navy: 'bg-baton-navy',
}

type CategoryChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean
  // The category color: a dot on the chip, and its fill when picked.
  // Without it (All) the chip has no dot and fills navy.
  tone?: RecTone
}

// Filter chip on Relay: a soft gray capsule with a dot in its category color,
// filled with that color when it's picked, so chips match their cards.
export function CategoryChip({ selected = false, tone, className, type = 'button', children, ...props }: CategoryChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cx(
        'inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full text-callout transition active:opacity-70',
        tone ? 'pl-4 pr-5' : 'px-6',
        selected ? cx(toneFill[tone ?? 'navy'], 'font-semibold ring-[1.5px] ring-inset ring-baton-navy') : 'bg-baton-chip text-ink',
        className,
      )}
      {...props}
    >
      {tone && <span aria-hidden className={cx('size-2.5 shrink-0 rounded-full', toneDot[tone])} />}
      {children}
    </button>
  )
}
