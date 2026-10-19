import { useState, type CSSProperties } from 'react'
import { navigate } from '../app/navigate'
import {
  datePillTops,
  wrapDoodles,
  wrapDots,
  wrapLine,
  wrapMoments,
  wrapped,
  wrapSummary,
  type WrapColor,
  type WrapMoment,
} from '../data/wrapped'
import { ArrowRightIcon, Button, cx, SpellOut } from '../ui'

// The Figma frames include the 54pt status bar; the app starts under it
const TOP = 54
const PHOTO = 135
const NOTE = 131

// Motion: every dot flies out to its moment and grows into it, all on the
// same clock, so the column reads as one camera zooming in. Colors then
// clear and the dates pop in top first. Times in ms.
const EXPAND = 1200
const STAGGER = 24
const EASE = 'cubic-bezier(0.7, 0, 0.3, 1)'

const dotFill: Record<WrapColor, string> = {
  pink: 'bg-baton-pink',
  blue: 'bg-baton-blue',
  yellow: 'bg-baton-yellow',
}
const noteFill: Record<WrapColor, string> = {
  pink: 'bg-baton-pink text-baton-navy',
  blue: 'bg-baton-blue text-white',
  yellow: 'bg-note-yellow text-baton-navy',
}
// The summary row uses the notes' softer yellow
const summaryFill: Record<WrapColor, string> = { ...dotFill, yellow: 'bg-note-yellow' }

// Once the moments land, the date pills pop in top to bottom, each timed
// by where it sits on the line, and the line draws down at the same speed
// just behind them
const PILL_DELAY = EXPAND * 0.85
const PILL_POP = 400
const MS_PER_PT = 0.9
const FIRST_PILL = datePillTops[0] - 70
const pillDelay = (top: number) => PILL_DELAY + (top - FIRST_PILL) * MS_PER_PT
const LINE_DELAY = PILL_DELAY + 150
const LINE_DRAW = wrapLine.height * MS_PER_PT

// The header spells itself out line by line, then the day count fades in
const LETTER = 30
const spellOutDuration = (text: string) => text.length * LETTER
const HEADER_START = 250
const FROM_START = HEADER_START + spellOutDuration(wrapped.title) + 150
const TO_START = FROM_START + spellOutDuration(wrapped.from) + 100
const DAYS_START = TO_START + spellOutDuration(wrapped.to) + 200

// Center of dot i on the first screen
const dotY = (index: number) => wrapDots.top + wrapDots.gap * index + wrapDots.size / 2

// LA Wrapped (Figma LA WRAPPED 258:1420 -> LA WRAPPED_2 236:1250): a pushed
// page opened from Profile. It opens on her 24 LA moments as a column of
// colored dots; tapping it zooms the column open into the timeline of the
// photos and notes those dots stand for, which then scrolls.
export function LaWrapped() {
  const [open, setOpen] = useState(false)

  return (
    <div className={cx('relative h-full bg-baton-paper', open ? 'overflow-y-auto' : 'overflow-hidden')}>
      <div className="relative mx-auto w-[402px] font-display text-baton-navy" style={{ height: wrapSummary.height - TOP }}>
        <Header open={open} />

        <div
          aria-hidden
          className="absolute w-px origin-top bg-wrap-line motion-reduce:transition-none"
          style={{
            left: wrapLine.x - 0.5,
            top: wrapLine.top - TOP,
            height: wrapLine.height,
            transform: open ? 'scaleY(1)' : 'scaleY(0)',
            transition: open ? `transform ${LINE_DRAW}ms linear ${LINE_DELAY}ms` : 'none',
          }}
        />

        {wrapMoments.map((moment, index) => (
          <Pills key={`pill-${moment.date}`} moment={moment} index={index} open={open} />
        ))}
        {wrapMoments.map((moment, index) => (
          <Moment key={moment.date} moment={moment} index={index} open={open} />
        ))}
        {wrapDoodles.map((doodle) => (
          <div
            key={`${doodle.x}-${doodle.y}`}
            aria-hidden
            className="pointer-events-none absolute overflow-hidden transition-opacity duration-500 motion-reduce:transition-none"
            style={{
              left: doodle.x,
              top: doodle.y - TOP,
              width: doodle.w,
              height: doodle.h,
              opacity: open ? 1 : 0,
              transitionDelay: open ? `${EXPAND + 300}ms` : '0ms',
            }}
          >
            <img
              src={doodle.src}
              alt=""
              className="absolute max-w-none"
              style={{ width: `${doodle.crop.w}%`, height: `${doodle.crop.h}%`, left: `${doodle.crop.left}%`, top: `${doodle.crop.top}%` }}
            />
          </div>
        ))}

        {open && <Summary />}

        {!open && (
          <button
            type="button"
            aria-label="Open your LA moments"
            onClick={() => setOpen(true)}
            className="absolute inset-0 cursor-pointer"
          />
        )}
      </div>
    </div>
  )
}

function Header({ open }: { open: boolean }) {
  return (
    <>
      <p className="absolute inset-x-0 text-center text-section leading-[1.3] font-medium" style={{ top: 88 - TOP }}>
        <SpellOut text={wrapped.title} delay={HEADER_START} step={LETTER} />
      </p>
      <p className="absolute -translate-x-1/2 text-wrap-date font-medium whitespace-nowrap" style={{ left: 127, top: 139 - TOP }}>
        <SpellOut text={wrapped.from} delay={FROM_START} step={LETTER} />
      </p>
      <p className="absolute -translate-x-1/2 text-wrap-date font-medium whitespace-nowrap" style={{ left: 246.5, top: 173 - TOP }}>
        <SpellOut text={wrapped.to} delay={TO_START} step={LETTER} />
      </p>
      <p
        className="absolute -translate-x-1/2 text-callout whitespace-nowrap text-wrap-faint transition-opacity duration-300 motion-reduce:transition-none"
        style={{ left: 320, top: 211 - TOP, opacity: open ? 0 : 1 }}
      >
        <span className="inline-block animate-fade-in motion-reduce:animate-none" style={{ animationDelay: `${DAYS_START}ms` }}>
          {wrapped.days}
        </span>
      </p>
    </>
  )
}

// One moment: a photo circle or a tilted note. Closed, it is shrunk to its
// dot on the first screen and covered in the dot's color; open, it sits in
// the timeline and the color clears to show the photo or words.
function Moment({ moment, index, open }: { moment: WrapMoment; index: number; open: boolean }) {
  const isPhoto = moment.kind === 'photo'
  const size = isPhoto ? PHOTO : NOTE
  const centerX = isPhoto ? moment.x + PHOTO / 2 : moment.cx
  const centerY = isPhoto ? moment.y + PHOTO / 2 : moment.cy
  const rotate = isPhoto ? 0 : moment.rotate
  // Color clears once the moment is well on its way, top first
  const reveal: CSSProperties = {
    transition: 'opacity 450ms ease-out',
    transitionDelay: open ? `${EXPAND * 0.5 + index * STAGGER}ms` : '0ms',
  }

  return (
    <div
      className={cx(
        'absolute overflow-hidden motion-reduce:transition-none',
        !isPhoto && (open ? noteFill[moment.color] : dotFill[moment.color]),
      )}
      style={{
        left: centerX - size / 2,
        top: centerY - size / 2 - TOP,
        width: size,
        height: size,
        borderRadius: isPhoto || !open ? size / 2 : 10,
        transform: open
          ? `translate(0px, 0px) scale(1) rotate(${rotate}deg)`
          : `translate(${wrapLine.x - centerX}px, ${dotY(index) - centerY}px) scale(${wrapDots.size / size}) rotate(0deg)`,
        // Notes stay dots until late, then square off into paper
        transition: `transform ${EXPAND}ms ${EASE}, border-radius ${EXPAND * 0.5}ms ease-in-out ${open ? EXPAND * 0.5 : 0}ms, background-color 600ms ease-out ${open ? EXPAND * 0.5 : 0}ms`,
      }}
    >
      {isPhoto ? (
        <>
          <img
            src={moment.src}
            alt=""
            className="absolute max-w-none"
            style={{ width: `${moment.crop.w}%`, height: `${moment.crop.h}%`, left: `${moment.crop.left}%`, top: `${moment.crop.top}%` }}
          />
          <img src={`/wrapped/ring-${moment.color}.svg`} alt="" className="absolute inset-0 size-full" />
          <div className={cx('absolute inset-0', dotFill[moment.color])} style={{ ...reveal, opacity: open ? 0 : 1 }} />
        </>
      ) : (
        <p className="absolute inset-[14px] text-card-body leading-[17px] font-medium" style={{ ...reveal, opacity: open ? 1 : 0 }}>
          {moment.text}
        </p>
      )}
    </div>
  )
}

// The date on the line (and the year above the first moment of a year).
// They pop in where each dot left the line.
function Pills({ moment, index, open }: { moment: WrapMoment; index: number; open: boolean }) {
  const top = datePillTops[index]
  const last = index === wrapMoments.length - 1
  const appear = (pillTop: number): CSSProperties => ({
    opacity: open ? 1 : 0,
    transform: open ? 'scale(1)' : 'scale(0.6)',
    transition: `opacity 300ms ease-out, transform ${PILL_POP}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
    transitionDelay: open ? `${pillDelay(pillTop)}ms` : '0ms',
  })

  return (
    <>
      {moment.year && (
        <Pill dark top={top - 70} style={appear(top - 70)}>
          {moment.year}
        </Pill>
      )}
      <Pill dark={last} top={top} style={appear(top)}>
        {moment.date}
      </Pill>
    </>
  )
}

function Pill({ dark, top, style, children }: { dark?: boolean; top: number; style: CSSProperties; children: string }) {
  return (
    <p
      className={cx(
        'absolute flex h-[30px] w-[55px] items-center justify-center rounded-[20px] pt-0.5 text-card-body whitespace-nowrap motion-reduce:transition-none',
        dark ? 'bg-baton-navy text-white' : 'bg-white text-wrap-faint shadow-pill',
      )}
      style={{ ...style, left: wrapLine.x - 27.5, top: top - TOP }}
    >
      {children}
    </p>
  )
}

function Summary() {
  return (
    <div className="absolute inset-x-0 flex animate-fade-in flex-col items-center" style={{ top: wrapSummary.titleTop - TOP }}>
      <p className="text-section leading-[1.3] font-medium">{wrapped.summaryTitle}</p>
      <p className="mt-0.5 text-callout text-wrap-faint">{wrapped.summaryStats}</p>
      <div className="mt-4 flex gap-[5px]" aria-hidden>
        {wrapMoments.map((moment) => (
          <span key={moment.date} className={cx('size-[9px] rounded-full', summaryFill[moment.color])} />
        ))}
      </div>
      <Button variant="glow" size="cta" onClick={() => navigate('rolling-paper')} className="mt-[30px] w-[309px]">
        {wrapped.cta}
        <ArrowRightIcon />
      </Button>
    </div>
  )
}
