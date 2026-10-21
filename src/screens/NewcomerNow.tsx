import { navigate } from '../app/navigate'
import { setState } from '../app/store'
import { newcomerNow } from '../data/newcomerNow'
import { ArrowRightIcon, Button, cx, folderTones, StageTag, TAB_PATH, TAB_WIDTH } from '../ui'

// "You're a Newcomer now": shown after LA Wrapped. Her LA folder slides aside
// and a new, empty New York folder lands on top of it, then the heading. The
// main button opens Archive, where that folder files itself in; the quiet one
// under it goes on to Today.
export function NewcomerNow() {
  return (
    <div className="relative flex h-full flex-col items-center bg-baton-paper font-display text-baton-navy">
      {/* Folders and heading together in the middle of the space above the button */}
      <div className="flex flex-1 flex-col items-center justify-center pb-[100px]">
        <div className="relative h-[230px] w-[320px] shrink-0">
          <Folder city="la" className="animate-folder-aside" />
          <Folder city="ny" className="animate-folder-arrive" />
        </div>

        <div className="mt-8 flex animate-splash-rise flex-col items-center" style={{ animationDelay: '1100ms' }}>
          {/* "You're a [Newcomer] / in New York now", the pill in the sentence */}
          <h1 className="text-center text-section leading-[1.36]">
            <span className="flex items-center justify-center gap-2">
              {newcomerNow.title.lead}
              <StageTag stage="newcomer" label={newcomerNow.tag} size="lg" tone="light" />
            </span>
            <span className="mt-1 block">{newcomerNow.title.rest}</span>
          </h1>
          <p className="mt-2 w-[290px] whitespace-pre-line text-center text-callout text-wrap-faint">{newcomerNow.subtitle}</p>
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-[20px] flex animate-splash-rise flex-col items-center"
        style={{ animationDelay: '1400ms' }}
      >
        <Button
          variant="glow"
          size="cta"
          onClick={() => {
            setState({ archiveArrival: 'ny', archiveSegment: 'mine' })
            navigate('archive')
          }}
          className="w-[309px]"
        >
          {newcomerNow.cta}
          <ArrowRightIcon />
        </Button>
        <button
          type="button"
          onClick={() => navigate('today')}
          className="mt-1 h-11 px-6 text-callout font-medium text-baton-navy/60 transition active:opacity-50"
        >
          {newcomerNow.secondary}
        </button>
      </div>
    </div>
  )
}

// A small Archive folder, drawn like the ones in Archive at 60%: the city on
// the tab and its dates large in the middle of the body, in that folder's
// Archive colors.
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
      {/* Just the dates, large, in the middle of the folder */}
      <div className={cx('flex h-[150px] items-center justify-center rounded-card px-5', styles.fill)}>
        <p className={cx('text-title-1 font-normal tracking-tight', styles.dates)}>{dates}</p>
      </div>
    </div>
  )
}
