import { navigate } from '../app/navigate'
import { newcomerNow } from '../data/newcomerNow'
import { ArrowRightIcon, Button, cx, folderTones, StageTag, TAB_PATH, TAB_WIDTH } from '../ui'

// "You're a Newcomer now": shown after LA Wrapped. Her LA folder slides aside
// and a new, empty New York folder lands on top of it, then the heading and
// on to Today.
export function NewcomerNow() {
  return (
    <div className="relative flex h-full flex-col items-center bg-baton-paper font-display text-baton-navy">
      <div className="relative mt-[56px] h-[230px] w-[320px] shrink-0">
        <Folder city="la" className="animate-folder-aside" />
        <Folder city="ny" className="animate-folder-arrive" />
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

// A small Archive folder, drawn like the ones in Archive at 60%: the city on
// the tab, the dates in the body, in that folder's Archive colors.
// LA is full (lines standing in for her lifestyle), New York is new and empty.
const SCALE = 0.6

function Folder({ city: id, className }: { city: 'la' | 'ny'; className: string }) {
  const { city, dates, tone } = newcomerNow[id]
  const styles = folderTones[tone]
  return (
    <div className={cx('absolute top-0 left-[30px] w-[260px] drop-shadow-[0_8px_18px_rgb(0_0_0/0.12)]', className)}>
      <div className="relative -mb-px ml-[22px]" style={{ width: TAB_WIDTH * SCALE, height: 52 * SCALE }}>
        <svg
          width={TAB_WIDTH * SCALE}
          height={53 * SCALE}
          viewBox={`0 0 ${TAB_WIDTH} 53`}
          aria-hidden
          className={cx('absolute inset-0 fill-current', styles.fillText)}
        >
          <path d={TAB_PATH} />
        </svg>
        <span
          className={cx(
            'absolute inset-0 flex items-center justify-center pt-1 pl-3 text-title-3 font-medium tracking-tight',
            styles.title,
          )}
        >
          {city}
        </span>
      </div>
      <div className={cx('flex h-[150px] flex-col rounded-[16px] px-5 pt-3', styles.fill)}>
        <p className={cx('text-caption', styles.dates)}>{dates}</p>
        {id === 'la' ? (
          <div className="mt-3 flex flex-col gap-1.5 opacity-60" aria-hidden>
            <span className="h-1.5 w-[80%] rounded-full bg-baton-cream/70" />
            <span className="h-1.5 w-[64%] rounded-full bg-baton-cream/70" />
            <span className="h-1.5 w-[72%] rounded-full bg-baton-cream/70" />
          </div>
        ) : (
          <p className={cx('mt-auto mb-4 text-caption', styles.dates)}>Nothing here yet</p>
        )}
      </div>
    </div>
  )
}
