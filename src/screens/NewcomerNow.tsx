import { navigate } from '../app/navigate'
import { newcomerNow } from '../data/newcomerNow'
import { ArrowRightIcon, Button, cx, StageTag, TAB_PATH, TAB_WIDTH } from '../ui'

// "You're a Newcomer now": shown after LA Wrapped. Her LA folder slides aside
// and a new, empty New York folder lands on top of it, then the heading and
// on to Today.
export function NewcomerNow() {
  return (
    <div className="relative flex h-full flex-col items-center bg-baton-paper font-display text-baton-navy">
      <div className="relative mt-[56px] h-[230px] w-[320px] shrink-0">
        <Folder tone="la" className="animate-folder-aside" />
        <Folder tone="ny" className="animate-folder-arrive" />
      </div>

      <div className="mt-8 flex animate-splash-rise flex-col items-center" style={{ animationDelay: '1100ms' }}>
        <StageTag stage="newcomer" label={newcomerNow.tag} size="md" />
        <h1 className="mt-3 text-center text-[24px] leading-[1.36] tracking-[-0.011em]">
          {newcomerNow.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-2 w-[290px] text-center text-callout text-wrap-faint">{newcomerNow.subtitle}</p>
      </div>

      <div
        className="absolute inset-x-0 bottom-[36px] flex animate-splash-rise justify-center"
        style={{ animationDelay: '1400ms' }}
      >
        <Button variant="glow" size="cta" onClick={() => navigate('today')} className="w-[309px]">
          {newcomerNow.cta}
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  )
}

// A small archive folder: the Archive tab outline over a rounded body.
// LA is full (her lifestyle line, faded), New York is new and empty.
function Folder({ tone, className }: { tone: 'la' | 'ny'; className: string }) {
  const { city, dates } = newcomerNow[tone]
  const la = tone === 'la'
  return (
    <div
      className={cx('absolute top-0 left-[14px] w-[260px] drop-shadow-[0_8px_18px_rgb(0_0_0/0.12)]', className)}
    >
      <svg
        width={TAB_WIDTH * 0.6}
        height={53 * 0.6}
        viewBox={`0 0 ${TAB_WIDTH} 53`}
        aria-hidden
        className={cx('-mb-px ml-[24px] block fill-current', la ? 'text-baton-blue' : 'text-baton-yellow')}
      >
        <path d={TAB_PATH} />
      </svg>
      <div
        className={cx(
          'flex h-[160px] flex-col rounded-[16px] px-5 pt-3',
          la ? 'bg-baton-blue text-baton-cream' : 'bg-baton-yellow text-baton-navy',
        )}
      >
        <p className="text-title-2 font-medium tracking-tight">{city}</p>
        <p className={cx('text-caption', la ? 'text-on-baton-blue-muted' : 'text-baton-navy/60')}>{dates}</p>
        {la ? (
          <div className="mt-3 flex flex-col gap-1.5 opacity-60" aria-hidden>
            <span className="h-1.5 w-[80%] rounded-full bg-baton-cream/70" />
            <span className="h-1.5 w-[64%] rounded-full bg-baton-cream/70" />
            <span className="h-1.5 w-[72%] rounded-full bg-baton-cream/70" />
          </div>
        ) : (
          <p className="mt-auto mb-4 text-caption text-baton-navy/60">Nothing here yet</p>
        )}
      </div>
    </div>
  )
}
