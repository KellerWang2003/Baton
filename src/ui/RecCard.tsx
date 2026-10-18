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

// Small glass tag naming a card's category, on the top left of its photo
function CategoryTag({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cx(
        'absolute rounded-full bg-glass px-2.5 py-1 text-caption font-semibold leading-none text-baton-navy backdrop-blur',
        className,
      )}
    >
      {label}
    </span>
  )
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
      {label && <CategoryTag label={label} className="left-3 top-3" />}
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
  // The category, as a small tag on the photo's top left (chips only show
  // color once picked)
  label?: string
  size?: keyof typeof recSizes
  onClick?: () => void
}

// A recommendation in a sideways row (Figma Relay 265:2550): the card takes its
// category color, a rounded photo on top, a bold name and a softer line under it.
export function RecCard({ title, text, tone, photo, label, size = 'lg', onClick }: RecCardProps) {
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
      <div className={cx('relative w-full shrink-0 overflow-hidden rounded-card', recSizes[size].photo)}>
        <img src={photo} alt="" draggable={false} className="size-full object-cover" />
        {label && <CategoryTag label={label} className={size === 'sm' ? 'left-2 top-2' : 'left-3 top-3'} />}
      </div>
      <div className="flex flex-col gap-1 px-2 pb-2">
        <p className="font-display text-card-title font-bold">{title}</p>
        <p className="line-clamp-3 text-card-body opacity-60">{text}</p>
      </div>
    </button>
  )
}

type CategoryChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean
  // Fill when picked, the same color as its cards. Without one (All) it fills navy.
  tone?: RecTone
}

// Filter chip on Relay (Figma 265:2550): a soft gray 40pt capsule that fills
// with its category color when it's picked.
export function CategoryChip({ selected = false, tone, className, type = 'button', ...props }: CategoryChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cx(
        'inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full px-6 text-callout font-medium leading-[1.2] transition active:opacity-70',
        selected ? toneFill[tone ?? 'navy'] : 'bg-baton-chip text-ink',
        className,
      )}
      {...props}
    />
  )
}
