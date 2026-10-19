import { navigate } from '../app/navigate'
import { intentions } from '../data/intentions'
import { ArrowRightIcon, Button } from '../ui'

export function IntentionsSet() {
  const copy = intentions.confirmation

  return (
    <div className="flex h-full flex-col bg-baton-paper px-gutter font-display text-baton-navy">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 pb-12 text-center">
        <h1 className="animate-splash-rise text-greeting font-normal text-balance motion-reduce:animate-none">
          {copy.title}
        </h1>
      </div>
      <div className="shrink-0 pb-9 pt-4">
        <Button block variant="glow" size="cta" onClick={() => navigate('today')}>
          {copy.cta}
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  )
}
