import type { ButtonHTMLAttributes, CSSProperties } from 'react'
import { cx } from './cx'
import type { RelayLook } from './relayLooks'
import { relayChipIdle } from './relayLooks'

export type RecTone = 'blue' | 'yellow' | 'pink' | 'olive' | 'cream' | 'navy'

const toneFill: Record<RecTone, string> = {
  // Type on brand blue is white (Keller, Oct 19)
  blue: 'bg-baton-blue text-on-brand',
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
  // Visual treatment from the Relay looks playground (flat is the original)
  look?: RelayLook
  // Who passed it on ("Baton's pick", "Maya's legacy"), for the looks that show it
  from?: string
  // Place in its row, so scrapbook scraps tilt different ways
  index?: number
}

// A recommendation in a sideways row (Figma Relay 265:2550): the card takes its
// category color, a rounded photo on top, a bold name and a softer line under it.
export function RecCard({ look = 'flat', ...props }: RecCardProps) {
  if (look === 'scrapbook') return <ScrapCard {...props} />
  if (look === 'ticket') return <TicketCard {...props} />
  if (look === 'postcard') return <PostcardCard {...props} />
  return <FlatCard {...props} paper={look === 'paper'} edged={look === 'bands'} />
}

function FlatCard({ title, text, tone, photo, label, size = 'lg', onClick, paper, edged }: RecCardProps & { paper?: boolean; edged?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'relative flex shrink-0 snap-start flex-col gap-3 overflow-hidden rounded-rec p-3 text-left transition active:scale-[0.98]',
        toneFill[tone],
        recSizes[size].card,
        // Paper: grain on the card and a soft shadow, lifted off the page (room for it below)
        paper && 'grain mb-3 shadow-rec',
        // On the navy band, a thin light edge keeps navy cards from melting in
        edged && 'ring-1 ring-baton-cream/25',
      )}
    >
      <div className={cx('relative w-full shrink-0 overflow-hidden rounded-card', recSizes[size].photo)}>
        <img src={photo} alt="" draggable={false} className="size-full object-cover" />
        {label && <CategoryTag label={label} className={size === 'sm' ? 'left-2 top-2' : 'left-3 top-3'} />}
      </div>
      <div className="flex flex-col gap-1 px-2 pb-2">
        <p className="font-display text-card-title font-medium">{title}</p>
        <p className="line-clamp-3 text-card-body opacity-60">{text}</p>
      </div>
    </button>
  )
}

const tilts = ['-rotate-[1.6deg]', 'rotate-[1.2deg]', '-rotate-[0.6deg]', 'rotate-[2deg]']

// Scrapbook: a tilted paper scrap taped into the row
function ScrapCard({ title, text, tone, photo, label, size = 'lg', onClick, index = 0 }: RecCardProps) {
  return (
    <div className={cx('shrink-0 snap-start px-1 pb-4 pt-3', recSizes[size].card)}>
      <button
        type="button"
        onClick={onClick}
        className={cx(
          'grain relative flex w-full flex-col gap-2.5 rounded-[6px] p-2.5 pb-4 text-left shadow-rec transition active:scale-[0.98]',
          toneFill[tone],
          tilts[index % tilts.length],
        )}
      >
        <span
          aria-hidden
          className={cx('absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-3 bg-baton-cream shadow-paper')}
        />
        <div className={cx('relative w-full shrink-0 overflow-hidden rounded-[3px]', recSizes[size].photo)}>
          <img src={photo} alt="" draggable={false} className="size-full object-cover" />
        </div>
        <div className="flex flex-col gap-1 px-1">
          {label && <p className="text-caption font-semibold opacity-60">{label}</p>}
          <p className="font-display text-card-title font-medium">{title}</p>
          <p className="line-clamp-3 text-card-body opacity-70">{text}</p>
        </div>
      </button>
    </div>
  )
}

// Relay pass: a ticket with side notches at the tear line and a stub naming who passed it on
function TicketCard({ title, text, tone, photo, label, size = 'lg', onClick, from }: RecCardProps) {
  const photoHeight = size === 'lg' ? 197 : 110
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ '--notch': `${12 + photoHeight + 12}px` } as CSSProperties}
      className={cx(
        'ticket-notch relative mb-3 flex shrink-0 snap-start flex-col overflow-hidden rounded-[22px] p-3 text-left transition active:scale-[0.98]',
        toneFill[tone],
        recSizes[size].card,
      )}
    >
      <div className={cx('relative w-full shrink-0 overflow-hidden rounded-[14px]', recSizes[size].photo)}>
        <img src={photo} alt="" draggable={false} className="size-full object-cover" />
        {label && <CategoryTag label={label} className={size === 'sm' ? 'left-2 top-2' : 'left-3 top-3'} />}
      </div>
      {/* Tear line between the notches */}
      <div aria-hidden className="mx-3 my-3 border-t-2 border-dashed border-current opacity-25" />
      <div className="mb-3 flex flex-col gap-1 px-2">
        <p className="font-display text-card-title font-medium">{title}</p>
        <p className="line-clamp-3 text-card-body opacity-60">{text}</p>
      </div>
      {from && (
        <div className="mt-auto flex items-center justify-between gap-2 rounded-full bg-baton-postcard/30 px-3 py-1.5 text-caption font-semibold">
          <span className="truncate">{from}</span>
          <span aria-hidden className="shrink-0 opacity-60">
            → you
          </span>
        </div>
      )}
    </button>
  )
}

// Postcard: warm white card stock, a perforated stamp in the category color and a postmark
function PostcardCard({ title, text, tone, photo, label, size = 'lg', onClick, from }: RecCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'grain relative mb-3 flex shrink-0 snap-start flex-col gap-3 rounded-[20px] bg-baton-postcard p-3 text-left text-baton-navy shadow-rec transition active:scale-[0.98]',
        recSizes[size].card,
      )}
    >
      <div className={cx('relative w-full shrink-0 overflow-hidden rounded-[12px]', recSizes[size].photo)}>
        <img src={photo} alt="" draggable={false} className="size-full object-cover" />
      </div>
      {/* Stamp and postmark over the photo's corner */}
      <span aria-hidden className={cx('absolute right-5 top-5 z-10 rotate-3 drop-shadow-sm', size === 'lg' ? 'h-[68px] w-14' : 'h-[54px] w-11')}>
        <span className={cx('stamp-edge flex size-full', toneFill[tone])}>
          <span className="flex size-full items-end justify-center px-0.5 pb-1 text-center font-display text-[7px] font-bold uppercase leading-[1.05] ring-1 ring-current/30 ring-inset">
            {label}
          </span>
        </span>
      </span>
      <span
        aria-hidden
        className={cx(
          'absolute z-10 flex -rotate-12 items-center justify-center rounded-full border-2 border-baton-navy/45 font-display text-[9px] font-bold uppercase leading-tight tracking-wider text-baton-navy/55',
          size === 'lg' ? 'right-[62px] top-[58px] size-14' : 'right-[48px] top-[44px] size-11',
        )}
      >
        New
        <br />
        York
      </span>
      <div className="flex flex-col gap-1 px-1.5">
        <p className="font-display text-card-title font-medium">{title}</p>
        <p className="line-clamp-3 text-card-body opacity-70">{text}</p>
        {from && <p className="mt-1.5 border-t border-dashed border-baton-navy/20 pt-1.5 text-caption font-semibold text-baton-navy/60">{from}</p>}
      </div>
    </button>
  )
}

type CategoryChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean
  // Fill when picked, the same color as its cards. Without one (All) it fills navy.
  tone?: RecTone
  look?: RelayLook
}

// Filter chip on Relay (Figma 265:2550): a soft gray 40pt capsule that fills
// with its category color when it's picked.
export function CategoryChip({ selected = false, tone, look = 'flat', className, type = 'button', ...props }: CategoryChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cx(
        'inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full px-6 text-callout font-medium leading-[1.2] transition active:opacity-70',
        selected ? toneFill[tone ?? 'navy'] : relayChipIdle[look],
        className,
      )}
      {...props}
    />
  )
}
